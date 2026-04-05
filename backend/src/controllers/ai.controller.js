const { callQwenChat } = require("../services/ai.service");

async function chatWithAI(req, res) {
  try {
    const { text = "", question = "null", messages = "[]" } = req.body;

    let parsedQuestion = null;
    let parsedMessages = [];

    try {
      parsedQuestion = question ? JSON.parse(question) : null;
    } catch {
      return res.status(400).json({
        message: "question 不是合法的 JSON",
      });
    }

    try {
      parsedMessages = messages ? JSON.parse(messages) : [];
    } catch {
      return res.status(400).json({
        message: "messages 不是合法的 JSON",
      });
    }

    const result = await callQwenChat({
      text,
      question: parsedQuestion,
      files: req.files || [],
      messages: parsedMessages,
    });

    return res.json({
      message: "success",
      data: result,
    });
  } catch (error) {
    return res.status(error?.response?.status || 500).json({
      message: "AI 调用失败",
      error:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error.message ||
        "unknown error",
      detail: error?.response?.data || null,
    });
  }
}

module.exports = {
  chatWithAI,
};
