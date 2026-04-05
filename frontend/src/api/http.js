const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

function buildUrl(url, params) {
  if (!params || typeof params !== "object") {
    return BASE_URL + url;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === "") return;
        searchParams.append(key, String(item));
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${BASE_URL + url}?${queryString}` : BASE_URL + url;
}

async function request(url, options = {}) {
  const { params, headers, ...restOptions } = options;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    ...restOptions,
  };

  const finalUrl = buildUrl(url, params);
  const response = await fetch(finalUrl, config);

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
  get: (url, options = {}) =>
    request(url, {
      method: "GET",
      ...options,
    }),

  post: (url, body, options = {}) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  patch: (url, body, options = {}) =>
    request(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (url, options = {}) =>
    request(url, {
      method: "DELETE",
      ...options,
    }),

  put: (url, body, options = {}) =>
    request(url, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),
};
