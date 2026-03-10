const {
  getAllQuestions,
  getQuestionById,
  createQuestionWithRelations,
  updateQuestionWithRelations,
  deleteQuestionWithRelations,
} = require("../models/question.model");

async function listQuestions(req, res) {
  try {
    const questions = await getAllQuestions();

    return res.json({
      message: "获取题目列表成功",
      data: questions,
    });
  } catch (error) {
    console.error("获取题目列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getQuestionDetail(req, res) {
  try {
    const { id } = req.params;
    const question = await getQuestionById(id);

    if (!question) {
      return res.status(404).json({
        message: "题目不存在",
      });
    }

    return res.json({
      message: "获取题目详情成功",
      data: question,
    });
  } catch (error) {
    console.error("获取题目详情失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createQuestion(req, res) {
  try {
    const {
      id,
      owner_type,
      teacher_id,
      title,
      subject_id,
      chapter_id,
      difficulty,
      source,
      is_real,
      analysis,
      correct_answer,
      options,
      knowledgePointIds,
      images,
    } = req.body || {};

    if (
      id == null ||
      !owner_type ||
      !title ||
      subject_id == null ||
      !difficulty ||
      !correct_answer
    ) {
      return res.status(400).json({
        message: "缺少必要字段",
      });
    }

    const created = await createQuestionWithRelations({
      id,
      owner_type,
      teacher_id: teacher_id ?? null,
      title,
      subject_id,
      chapter_id: chapter_id ?? null,
      difficulty,
      source: source ?? null,
      is_real: is_real ? 1 : 0,
      analysis: analysis ?? null,
      correct_answer,
      options: options || [],
      knowledgePointIds: knowledgePointIds || [],
      images: images || [],
    });

    return res.status(201).json({
      message: "创建题目成功",
      data: created,
    });
  } catch (error) {
    console.error("创建题目失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const oldQuestion = await getQuestionById(id);

    if (!oldQuestion) {
      return res.status(404).json({
        message: "题目不存在",
      });
    }

    const {
      owner_type,
      teacher_id,
      title,
      subject_id,
      chapter_id,
      difficulty,
      source,
      is_real,
      analysis,
      correct_answer,
      options,
      knowledgePointIds,
      images,
    } = req.body || {};

    if (
      !owner_type ||
      !title ||
      subject_id == null ||
      !difficulty ||
      !correct_answer
    ) {
      return res.status(400).json({
        message: "缺少必要字段",
      });
    }

    const updated = await updateQuestionWithRelations(id, {
      owner_type,
      teacher_id: teacher_id ?? null,
      title,
      subject_id,
      chapter_id: chapter_id ?? null,
      difficulty,
      source: source ?? null,
      is_real: is_real ? 1 : 0,
      analysis: analysis ?? null,
      correct_answer,
      options: options || [],
      knowledgePointIds: knowledgePointIds || [],
      images: images || [],
    });

    return res.json({
      message: "更新题目成功",
      data: updated,
    });
  } catch (error) {
    console.error("更新题目失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function removeQuestion(req, res) {
  try {
    const { id } = req.params;
    const oldQuestion = await getQuestionById(id);

    if (!oldQuestion) {
      return res.status(404).json({
        message: "题目不存在",
      });
    }

    await deleteQuestionWithRelations(id);

    return res.json({
      message: "删除题目成功",
    });
  } catch (error) {
    console.error("删除题目失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

module.exports = {
  listQuestions,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
  removeQuestion,
};
