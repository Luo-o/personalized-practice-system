const {
  getAllExams,
  getExamById,
  getExamQuestions,
  createExamWithQuestions,
  updateExamWithQuestions,
  deleteExamWithQuestions,
} = require("../models/exam.model");

async function listExams(req, res) {
  try {
    const exams = await getAllExams();

    return res.json({
      message: "获取考试列表成功",
      data: exams,
    });
  } catch (error) {
    console.error("获取考试列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getExamDetail(req, res) {
  try {
    const { id } = req.params;
    const exam = await getExamById(id);

    if (!exam) {
      return res.status(404).json({
        message: "考试不存在",
      });
    }

    return res.json({
      message: "获取考试详情成功",
      data: exam,
    });
  } catch (error) {
    console.error("获取考试详情失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getExamQuestionList(req, res) {
  try {
    const { id } = req.params;
    const exam = await getExamById(id);

    if (!exam) {
      return res.status(404).json({
        message: "考试不存在",
      });
    }

    const questions = await getExamQuestions(id);

    return res.json({
      message: "获取考试题目成功",
      data: {
        exam,
        questions,
      },
    });
  } catch (error) {
    console.error("获取考试题目失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createExam(req, res) {
  try {
    const {
      id,
      title,
      class_id,
      teacher_id,
      subject_id,
      publish_at,
      deadline_at,
      status,
      duration_minutes,
      total_score,
      questionIds,
    } = req.body || {};

    if (
      id == null ||
      !title ||
      class_id == null ||
      teacher_id == null ||
      subject_id == null ||
      !status
    ) {
      return res.status(400).json({
        message: "缺少必要字段",
      });
    }

    const created = await createExamWithQuestions({
      id,
      title,
      class_id,
      teacher_id,
      subject_id,
      publish_at: publish_at ?? null,
      deadline_at: deadline_at ?? null,
      status,
      duration_minutes: duration_minutes ?? null,
      total_score: total_score ?? null,
      questionIds: questionIds || [],
    });

    return res.status(201).json({
      message: "创建考试成功",
      data: created,
    });
  } catch (error) {
    console.error("创建考试失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function updateExam(req, res) {
  try {
    const { id } = req.params;
    const oldExam = await getExamById(id);

    if (!oldExam) {
      return res.status(404).json({
        message: "考试不存在",
      });
    }

    const {
      title,
      class_id,
      teacher_id,
      subject_id,
      publish_at,
      deadline_at,
      status,
      duration_minutes,
      total_score,
      questionIds,
    } = req.body || {};

    if (
      !title ||
      class_id == null ||
      teacher_id == null ||
      subject_id == null ||
      !status
    ) {
      return res.status(400).json({
        message: "缺少必要字段",
      });
    }

    const updated = await updateExamWithQuestions(id, {
      title,
      class_id,
      teacher_id,
      subject_id,
      publish_at: publish_at ?? null,
      deadline_at: deadline_at ?? null,
      status,
      duration_minutes: duration_minutes ?? null,
      total_score: total_score ?? null,
      questionIds: questionIds || [],
    });

    return res.json({
      message: "更新考试成功",
      data: updated,
    });
  } catch (error) {
    console.error("更新考试失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function removeExam(req, res) {
  try {
    const { id } = req.params;
    const oldExam = await getExamById(id);

    if (!oldExam) {
      return res.status(404).json({
        message: "考试不存在",
      });
    }

    await deleteExamWithQuestions(id);

    return res.json({
      message: "删除考试成功",
    });
  } catch (error) {
    console.error("删除考试失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

module.exports = {
  listExams,
  getExamDetail,
  getExamQuestionList,
  createExam,
  updateExam,
  removeExam,
};
