const {
  getWrongQuestionsByStudentId,
  getAnswerRecordsByStudentId,
  updateWrongQuestionStatusById,
} = require("../models/student.model");

// 获取错题本
async function getWrongQuestions(req, res) {
  try {
    const { id } = req.params;

    const data = await getWrongQuestionsByStudentId(id);

    return res.json({
      message: "获取错题本成功",
      data,
    });
  } catch (error) {
    console.error("获取错题本失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

// 获取学生全部答题记录
async function getStudentAnswerRecords(req, res) {
  try {
    const { id } = req.params;

    const data = await getAnswerRecordsByStudentId(id);

    return res.json({
      message: "获取学生答题记录成功",
      data,
    });
  } catch (error) {
    console.error("获取学生答题记录失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

// 更新状态（已掌握）
async function updateWrongQuestionStatus(req, res) {
  try {
    const { studentId, questionId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "缺少 status",
      });
    }

    await updateWrongQuestionStatusById(studentId, questionId, status);

    return res.json({
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新错题状态失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

module.exports = {
  getWrongQuestions,
  getStudentAnswerRecords,
  updateWrongQuestionStatus,
};
