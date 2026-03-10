const {
  getStudentExams,
  getAllSubmissions,
  getSubmissionById,
  getAnswerRecordsBySubmissionId,
  getSubmissionsByExamId,
  createSubmissionWithAnswers,
  getExamById,
} = require("../models/submission.model");

async function getStudentExamList(req, res) {
  try {
    const { id } = req.params;
    const exams = await getStudentExams(id);

    return res.json({
      message: "获取学生考试列表成功",
      data: exams,
    });
  } catch (error) {
    console.error("获取学生考试列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function listSubmissions(req, res) {
  try {
    const submissions = await getAllSubmissions();

    return res.json({
      message: "获取提交记录列表成功",
      data: submissions,
    });
  } catch (error) {
    console.error("获取提交记录列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getSubmissionDetail(req, res) {
  try {
    const { id } = req.params;
    const submission = await getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({
        message: "提交记录不存在",
      });
    }

    const answerRecords = await getAnswerRecordsBySubmissionId(id);

    return res.json({
      message: "获取提交记录详情成功",
      data: {
        submission,
        answerRecords,
      },
    });
  } catch (error) {
    console.error("获取提交记录详情失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createSubmission(req, res) {
  try {
    const { id, exam_id, student_id, duration_min, submitted_at, answers } =
      req.body || {};

    if (
      id == null ||
      exam_id == null ||
      student_id == null ||
      !submitted_at ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        message: "缺少必要字段或 answers 格式错误",
      });
    }

    const created = await createSubmissionWithAnswers({
      id,
      exam_id,
      student_id,
      duration_min: duration_min ?? null,
      submitted_at,
      answers,
    });

    return res.status(201).json({
      message: "提交答卷成功",
      data: created,
    });
  } catch (error) {
    console.error("提交答卷失败:", error);
    return res.status(400).json({
      message: error.message || "提交失败",
    });
  }
}

async function getExamSubmissionList(req, res) {
  try {
    const { id } = req.params;
    const exam = await getExamById(id);

    if (!exam) {
      return res.status(404).json({
        message: "考试不存在",
      });
    }

    const submissions = await getSubmissionsByExamId(id);

    return res.json({
      message: "获取考试提交记录成功",
      data: {
        exam,
        submissions,
      },
    });
  } catch (error) {
    console.error("获取考试提交记录失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

module.exports = {
  getStudentExamList,
  listSubmissions,
  getSubmissionDetail,
  createSubmission,
  getExamSubmissionList,
};
