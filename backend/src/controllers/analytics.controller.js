const {
  getWrongQuestionsByStudent,
  getStudentStats,
  getExamAnalytics,
  getClassKnowledgeStats,
} = require("../models/analytics.model");

async function getWrongQuestions(req, res) {
  try {
    const { id } = req.params;

    const questions = await getWrongQuestionsByStudent(id);

    return res.json({
      message: "获取错题本成功",
      data: questions,
    });
  } catch (error) {
    console.error("获取错题失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getStudentStatistics(req, res) {
  try {
    const { id } = req.params;

    const stats = await getStudentStats(id);

    const accuracy =
      stats.total_questions > 0
        ? (stats.total_correct / stats.total_questions).toFixed(2)
        : 0;

    return res.json({
      message: "获取学生统计成功",
      data: {
        examCount: stats.exam_count || 0,
        totalQuestions: stats.total_questions || 0,
        totalCorrect: stats.total_correct || 0,
        accuracy,
        avgScore: stats.avg_score || 0,
      },
    });
  } catch (error) {
    console.error("获取学生统计失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getExamStatistics(req, res) {
  try {
    const { id } = req.params;

    const rows = await getExamAnalytics(id);

    const result = rows.map((item) => {
      const answered = Number(item.answered_count || 0);
      const correct = Number(item.correct_count || 0);

      return {
        questionId: item.question_id,
        title: item.title,
        answered,
        correct,
        accuracy:
          answered > 0 ? Number(((correct / answered) * 100).toFixed(0)) : 0,
        wrongOption: item.wrong_option || "",
        wrongText: item.wrong_option_text || "",
      };
    });

    return res.json({
      message: "获取考试统计成功",
      data: result,
    });
  } catch (error) {
    console.error("获取考试统计失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getClassKnowledgeMastery(req, res) {
  try {
    const { classId } = req.params;
    const { subjectId } = req.query;

    const data = await getClassKnowledgeStats(
      Number(classId),
      subjectId ? Number(subjectId) : null,
    );

    return res.json({
      message: "获取班级知识点掌握情况成功",
      data,
    });
  } catch (error) {
    console.error("获取班级知识点掌握情况失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

module.exports = {
  getWrongQuestions,
  getStudentStatistics,
  getExamStatistics,
  getClassKnowledgeMastery,
};
