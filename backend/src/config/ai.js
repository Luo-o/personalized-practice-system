require("dotenv").config();

const AI_CONFIG = {
  baseUrl:
    process.env.DASHSCOPE_BASE_URL ||
    "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY || "",
  textModel: process.env.QWEN_TEXT_MODEL || "qwen-plus",
  visionModel: process.env.QWEN_VISION_MODEL || "qwen3-vl-plus",
  maxHistory: Number(process.env.AI_MAX_HISTORY || 6),
  timeout: 60000,
};

function validateAIConfig() {
  if (!AI_CONFIG.apiKey) {
    throw new Error("缺少 DASHSCOPE_API_KEY，请检查 backend/.env");
  }
}

module.exports = {
  AI_CONFIG,
  validateAIConfig,
};
