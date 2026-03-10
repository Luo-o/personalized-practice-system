const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

async function request(url, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  const response = await fetch(BASE_URL + url, config);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "请求失败");
  }

  return data?.data ?? data;
}

export const http = {
  get: (url) => request(url),

  post: (url, body) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (url, body) =>
    request(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (url) =>
    request(url, {
      method: "DELETE",
    }),
};
