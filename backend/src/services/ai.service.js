const axios = require("axios");
const { AI_CONFIG, validateAIConfig } = require("../config/ai");
const { BASE_SYSTEM_PROMPT } = require("../config/prompt");

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeQuestion(question) {
  if (!question || typeof question !== "object") return null;
  return question;
}

function buildSystemPrompt(question) {
  const q = normalizeQuestion(question);

  const subject = q?.subject_name || q?.subjectName || "";
  const chapter = q?.chapter_name || q?.chapterName || "";
  const difficulty = q?.difficulty || "";
  const stem = q?.stem || "";

  const contextLines = [
    subject ? `当前科目：${subject}` : "",
    chapter ? `当前章节：${chapter}` : "",
    difficulty ? `当前难度：${difficulty}` : "",
    stem ? `当前题目：${stem}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return [BASE_SYSTEM_PROMPT, contextLines].filter(Boolean).join("\n");
}

function trimHistory(messages = [], maxHistory = 6) {
  if (!Array.isArray(messages)) return [];
  const valid = messages.filter(
    (m) => m && (m.role === "user" || m.role === "assistant"),
  );
  return valid.slice(-maxHistory);
}

function mapHistoryMessages(messages = []) {
  return messages.map((m) => {
    const text = safeText(m.text);
    const images = Array.isArray(m.images) ? m.images : [];

    if (images.length > 0) {
      const content = [];

      if (text) {
        content.push({
          type: "text",
          text,
        });
      }

      images.forEach((img) => {
        if (img?.url) {
          content.push({
            type: "image_url",
            image_url: {
              url: img.url,
            },
          });
        }
      });

      return {
        role: m.role,
        content,
      };
    }

    return {
      role: m.role,
      content: text || "",
    };
  });
}

function buildCurrentUserMessage({ text, files = [] }) {
  const userText = safeText(text) || "请结合我上传的图片进行分析。";

  if (!Array.isArray(files) || files.length === 0) {
    return {
      role: "user",
      content: userText,
    };
  }

  const content = [
    {
      type: "text",
      text: userText,
    },
  ];

  files.forEach((file) => {
    if (!file?.mimetype?.startsWith("image/")) return;

    const base64 = file.buffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    content.push({
      type: "image_url",
      image_url: {
        url: dataUrl,
      },
    });
  });

  return {
    role: "user",
    content,
  };
}

async function callQwenChat({ text, question, files = [], messages = [] }) {
  validateAIConfig();

  const hasImages =
    Array.isArray(files) &&
    files.some((file) => file?.mimetype?.startsWith("image/"));

  const model = hasImages ? AI_CONFIG.visionModel : AI_CONFIG.textModel;
  const history = trimHistory(messages, AI_CONFIG.maxHistory);

  const payload = {
    model,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(question),
      },
      ...mapHistoryMessages(history),
      buildCurrentUserMessage({ text, files }),
    ],
    temperature: 0.7,
  };

  const response = await axios.post(
    `${AI_CONFIG.baseUrl}/chat/completions`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: AI_CONFIG.timeout,
    },
  );

  const reply = response?.data?.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error("模型返回内容为空");
  }

  return {
    reply,
    model: response?.data?.model || model,
    usage: response?.data?.usage || null,
  };
}

module.exports = {
  callQwenChat,
};
