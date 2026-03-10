const {
  getAllSubjects,
  getSubjectById,
  getChaptersBySubjectId,
  getKnowledgePointsBySubjectId,
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

module.exports = {
  listSubjects,
  listChaptersBySubject,
  listKnowledgePointsBySubject,
};
