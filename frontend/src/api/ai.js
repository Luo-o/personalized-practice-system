export async function askAI(text, question, files = [], messages = []) {
  const formData = new FormData();
  formData.append("text", text || "");
  formData.append("question", JSON.stringify(question || null));
  formData.append("messages", JSON.stringify(messages || []));

  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await fetch("http://localhost:8088/api/ai/chat", {
    method: "POST",
    body: formData,
  });

  const rawText = await response.text();
  let result = null;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error(`接口返回的不是合法 JSON：${rawText || "空响应"}`);
  }

  if (!response.ok) {
    throw new Error(result?.error || result?.message || "AI 请求失败");
  }

  return result?.data?.reply || "AI 暂无回复";
}
