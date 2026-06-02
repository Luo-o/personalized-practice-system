const practiceService = require("../services/practice.service");

function toBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;

  const s = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;

  return fallback;
}

function toIdArray(value) {
  if (value == null || value === "") return [];

  const rawList = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((item) => item.trim());

  return rawList.filter(
    (item) => item !== null && item !== undefined && String(item) !== "",
  );
}

async function getMeta(req, res) {
  try {
    const data = await practiceService.getPracticeMeta();

    return res.json({
      message: "获取刷题配置成功",
      data,
    });
  } catch (error) {
    console.error("获取刷题配置失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getStats(req, res) {
  try {
    const { subjectId, onlyTrue, chapterIds, knowledgeIds } = req.query || {};

    const data = await practiceService.getPracticeStats({
      subjectId: Number(subjectId),
      onlyTrue: toBoolean(onlyTrue, false),
      chapterIds: toIdArray(chapterIds),
      knowledgePointIds: toIdArray(knowledgeIds),
    });

    return res.json({
      message: "获取刷题统计成功",
      data,
    });
  } catch (error) {
    console.error("获取刷题统计失败:", error);
    return res.status(400).json({
      message: error.message || "获取刷题统计失败",
    });
  }
}

async function generate(req, res) {
  try {
    const {
      studentId,
      strategy,
      subjectId,
      total,
      split,
      chapterIds,
      knowledgeIds,
      onlyTrue,
      shuffle,
      epsilon,
    } = req.body || {};

    if (studentId == null || subjectId == null) {
      return res.status(400).json({
        message: "缺少 studentId 或 subjectId",
      });
    }

    const data = await practiceService.generatePractice(studentId, {
      strategy,
      subjectId,
      total,
      split,
      chapterIds,
      knowledgeIds,
      onlyTrue,
      shuffle,
      epsilon,
    });

    return res.status(201).json({
      message: "生成练习成功",
      data,
    });
  } catch (error) {
    console.error("生成练习失败:", error);
    return res.status(400).json({
      message: error.message || "生成练习失败",
    });
  }
}

async function detail(req, res) {
  try {
    const { id } = req.params;
    const data = await practiceService.getPracticeDetail(id);

    return res.json({
      message: "获取练习详情成功",
      data,
    });
  } catch (error) {
    console.error("获取练习详情失败:", error);
    return res.status(404).json({
      message: error.message || "练习不存在",
    });
  }
}

module.exports = {
  getMeta,
  getStats,
  generate,
  detail,
};
