const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AdmZip = require("adm-zip");
const { execFile } = require("child_process");

const router = express.Router();

const tempRoot = path.join(__dirname, "../temp/question-imports");
const publicImagesRoot = path.join(
  __dirname,
  "../public/images/question-imports",
);

fs.mkdirSync(tempRoot, { recursive: true });
fs.mkdirSync(publicImagesRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, tempRoot);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || ".zip");
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const isZip =
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.originalname.toLowerCase().endsWith(".zip");

    if (!isZip) {
      return cb(new Error("仅支持上传 zip 压缩包"));
    }
    cb(null, true);
  },
});

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeIfExists(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch (_) {}
}

function normalizeSlash(p = "") {
  return String(p).replace(/\\/g, "/");
}

function isInside(parent, child) {
  const parentResolved = path.resolve(parent);
  const childResolved = path.resolve(child);
  return (
    childResolved === parentResolved ||
    childResolved.startsWith(parentResolved + path.sep)
  );
}

function walkFindFile(rootDir, targetName) {
  if (!fs.existsSync(rootDir)) return null;

  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase() === targetName.toLowerCase()
      ) {
        return fullPath;
      }
    }
  }

  return null;
}

function copyFileSafe(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function createSampleQuestions() {
  return [
    {
      owner_type: "system",
      teacher_id: null,
      subject_id: 1,
      chapter_id: "5.1",
      title: "传输层为()之间提供逻辑通信。",
      difficulty: "简单",
      source: "示例题库",
      is_real: 0,
      analysis: "传输层面向应用进程提供逻辑通信服务。",
      correct_answer: "A",
      options: [
        { key: "A", text: "应用进程", sort_order: 1 },
        { key: "B", text: "主机", sort_order: 2 },
        { key: "C", text: "路由器", sort_order: 3 },
        { key: "D", text: "网卡", sort_order: 4 },
      ],
      images: [{ image_url: "images/example_question_1.png", sort_order: 1 }],
      knowledge_point_names: ["传输层功能"],
    },
  ];
}

function createSamplePngBuffer() {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l9tQAAAAASUVORK5CYII=";
  return Buffer.from(base64, "base64");
}

router.get("/template/json", (req, res) => {
  const content = JSON.stringify(createSampleQuestions(), null, 2);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=sample_questions.json",
  );
  res.send(content);
});

router.get("/template/zip", (req, res) => {
  const zip = new AdmZip();
  zip.addFile(
    "questions.json",
    Buffer.from(JSON.stringify(createSampleQuestions(), null, 2), "utf-8"),
  );
  zip.addFile("images/example_question_1.png", createSamplePngBuffer());

  const buffer = zip.toBuffer();
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=sample_question_import.zip",
  );
  res.send(buffer);
});

router.post("/import-zip", upload.single("file"), async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      message: "请先上传 zip 压缩包",
    });
  }

  const {
    subjectId,
    skipReview = "true",
    dedup = "true",
    clearExisting = "false",
  } = req.body;

  if (!subjectId || Number.isNaN(Number(subjectId))) {
    removeIfExists(uploadedFile.path);
    return res.status(400).json({
      message: "请先选择有效的导入科目",
    });
  }

  const normalizedSubjectId = Number(subjectId);

  const taskId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const extractDir = path.join(tempRoot, `extract_${taskId}`);
  const rewrittenJsonPath = path.join(tempRoot, `rewritten_${taskId}.json`);
  const imageOutputDir = path.join(publicImagesRoot, taskId);

  ensureDir(extractDir);
  ensureDir(imageOutputDir);

  try {
    const zip = new AdmZip(uploadedFile.path);
    zip.extractAllTo(extractDir, true);

    const questionsJsonPath = walkFindFile(extractDir, "questions.json");
    if (!questionsJsonPath) {
      throw new Error("压缩包中未找到 questions.json");
    }

    const raw = fs.readFileSync(questionsJsonPath, "utf-8");
    let questions = JSON.parse(raw);

    if (!Array.isArray(questions)) {
      throw new Error("questions.json 顶层必须是数组");
    }

    let referencedImageCount = 0;

    questions = questions.map((question, qIndex) => {
      const images = Array.isArray(question.images) ? question.images : [];
      const nextImages = images.map((img, imgIndex) => {
        const original = normalizeSlash(img?.image_url || "").trim();

        if (!original) return img;

        referencedImageCount += 1;

        const normalizedRelative = original.replace(/^\.?\//, "");
        const sourceAbs = path.resolve(extractDir, normalizedRelative);

        if (!isInside(extractDir, sourceAbs)) {
          throw new Error(
            `第 ${qIndex + 1} 题第 ${imgIndex + 1} 张图片路径非法：${original}`,
          );
        }

        if (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isFile()) {
          throw new Error(`第 ${qIndex + 1} 题引用的图片不存在：${original}`);
        }

        let relativeUnderImages = normalizedRelative;
        if (relativeUnderImages.startsWith("images/")) {
          relativeUnderImages = relativeUnderImages.slice("images/".length);
        }

        if (!relativeUnderImages) {
          throw new Error(`第 ${qIndex + 1} 题图片路径无效：${original}`);
        }

        const targetAbs = path.join(imageOutputDir, relativeUnderImages);
        copyFileSafe(sourceAbs, targetAbs);

        return {
          ...img,
          image_url: normalizeSlash(
            `/images/question-imports/${taskId}/${relativeUnderImages}`,
          ),
        };
      });

      return {
        ...question,
        subject_id: normalizedSubjectId,
        images: nextImages,
      };
    });

    fs.writeFileSync(
      rewrittenJsonPath,
      JSON.stringify(questions, null, 2),
      "utf-8",
    );

    const scriptPath = path.join(
      __dirname,
      "../scripts/import_questions_with_kp_to_db.py",
    );
    const dbPath = path.join(__dirname, "../../database/app.db");

    const pythonCmd =
      process.env.PYTHON_BIN ||
      (process.platform === "win32" ? "py" : "python3");

    execFile(
      pythonCmd,
      [
        scriptPath,
        "--json",
        rewrittenJsonPath,
        "--db",
        dbPath,
        "--skip-review",
        String(skipReview),
        "--dedup",
        String(dedup),
        "--clear-existing",
        String(clearExisting),
      ],
      {
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 20,
      },
      (error, stdout, stderr) => {
        removeIfExists(uploadedFile.path);
        removeIfExists(extractDir);
        removeIfExists(rewrittenJsonPath);

        if (stderr) {
          console.log("[question-import stderr]", stderr);
        }

        if (error) {
          removeIfExists(imageOutputDir);

          let parsed = null;
          try {
            parsed = JSON.parse(stdout || "{}");
          } catch (_) {}

          return res.status(500).json({
            message: parsed?.message || "批量导入失败",
            detail: stderr || stdout || error.message,
          });
        }

        let result = null;
        try {
          result = JSON.parse(stdout || "{}");
        } catch (_) {
          removeIfExists(imageOutputDir);
          return res.status(500).json({
            message: "导入脚本返回结果解析失败",
            detail: stdout,
          });
        }

        if (!result?.success) {
          removeIfExists(imageOutputDir);
          return res.status(500).json({
            message: result?.message || "批量导入失败",
          });
        }

        return res.json({
          message: "批量导入成功",
          data: {
            ...result,
            subject_id: normalizedSubjectId,
            image_count: referencedImageCount,
            image_base_url: `/images/question-imports/${taskId}/`,
          },
        });
      },
    );
  } catch (error) {
    removeIfExists(uploadedFile.path);
    removeIfExists(extractDir);
    removeIfExists(rewrittenJsonPath);
    removeIfExists(imageOutputDir);

    return res.status(400).json({
      message: error?.message || "解析压缩包失败",
    });
  }
});

module.exports = router;
