const {
  getWrongQuestionsByStudent,
  getStudentStats,
  getExamAnalytics,
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

    const result = rows.map((item) => ({
      questionId: item.question_id,
      title: item.title,
      answered: item.answered_count || 0,
      correct: item.correct_count || 0,
      accuracy:
        item.answered_count > 0
          ? (item.correct_count / item.answered_count).toFixed(2)
          : 0,
    }));

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

module.exports = {
  getWrongQuestions,
  getStudentStatistics,
  getExamStatistics,
};
