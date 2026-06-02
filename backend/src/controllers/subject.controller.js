const {
  getAllSubjects,
  getSubjectById,
  getChaptersBySubjectId,
  getKnowledgePointsBySubjectId,
  createSubjectModel,
  createChapterModel,
  createKnowledgePointModel,
  getChapterById,
  getSubjectByName,
  getChapterBySubjectIdAndName,
  getKnowledgePointByChapterIdAndName,
} = require("../models/subject.model");

async function listSubjects(req, res) {
  try {
    const subjects = await getAllSubjects();

    return res.json({
      message: "获取科目列表成功",
      data: subjects,
    });
  } catch (error) {
    console.error("获取科目列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function listChaptersBySubject(req, res) {
  try {
    const { id } = req.params;

    const subject = await getSubjectById(id);
    if (!subject) {
      return res.status(404).json({
        message: "科目不存在",
      });
    }

    const chapters = await getChaptersBySubjectId(id);

    return res.json({
      message: "获取章节列表成功",
      data: {
        subject,
        chapters,
      },
    });
  } catch (error) {
    console.error("获取章节列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function listKnowledgePointsBySubject(req, res) {
  try {
    const { id } = req.params;

    const subject = await getSubjectById(id);
    if (!subject) {
      return res.status(404).json({
        message: "科目不存在",
      });
    }

    const knowledgePoints = await getKnowledgePointsBySubjectId(id);

    return res.json({
      message: "获取知识点列表成功",
      data: {
        subject,
        knowledgePoints,
      },
    });
  } catch (error) {
    console.error("获取知识点列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createSubject(req, res) {
  try {
    const { name } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "科目名称不能为空",
      });
    }

    const subjectName = String(name).trim();

    const existed = await getSubjectByName(subjectName);
    if (existed) {
      return res.status(409).json({
        message: "科目已存在",
        data: existed,
      });
    }

    const created = await createSubjectModel({
      name: subjectName,
    });

    return res.status(201).json({
      message: "新增科目成功",
      data: created,
    });
  } catch (error) {
    console.error("新增科目失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createChapter(req, res) {
  try {
    const { id } = req.params;
    const { name, sort_order } = req.body;

    const subject = await getSubjectById(id);
    if (!subject) {
      return res.status(404).json({
        message: "科目不存在",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "章节名称不能为空",
      });
    }

    const chapterName = String(name).trim();

    const existed = await getChapterBySubjectIdAndName(id, chapterName);
    if (existed) {
      return res.status(409).json({
        message: "该科目下章节已存在",
        data: existed,
      });
    }

    const created = await createChapterModel({
      subject_id: Number(id),
      name: chapterName,
      sort_order,
    });

    return res.status(201).json({
      message: "新增章节成功",
      data: created,
    });
  } catch (error) {
    console.error("新增章节失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createKnowledgePoint(req, res) {
  try {
    const { id } = req.params;
    const { name, sort_order } = req.body;

    const chapter = await getChapterById(id);
    if (!chapter) {
      return res.status(404).json({
        message: "章节不存在",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "知识点名称不能为空",
      });
    }

    const knowledgePointName = String(name).trim();

    const existed = await getKnowledgePointByChapterIdAndName(
      id,
      knowledgePointName,
    );
    if (existed) {
      return res.status(409).json({
        message: "该章节下知识点已存在",
        data: existed,
      });
    }

    const created = await createKnowledgePointModel({
      chapter_id: id,
      name: knowledgePointName,
      sort_order,
    });

    return res.status(201).json({
      message: "新增知识点成功",
      data: created,
    });
  } catch (error) {
    console.error("新增知识点失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

module.exports = {
  listSubjects,
  listChaptersBySubject,
  listKnowledgePointsBySubject,
  createSubject,
  createChapter,
  createKnowledgePoint,
};
