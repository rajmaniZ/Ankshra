const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("auth:logout"),
    );
  }

  if (!response.ok || result?.success === false) {
    const error = new Error(
      result?.message ||
        "Something went wrong",
    );

    error.status = response.status;
    error.data = result;

    throw error;
  }

  return result;
}

export function get(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "GET",
  });
}

export function post(
  endpoint,
  body,
  options = {},
) {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patch(
  endpoint,
  body,
  options = {},
) {
  return apiRequest(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function put(
  endpoint,
  body,
  options = {},
) {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function remove(
  endpoint,
  options = {},
) {
  return apiRequest(endpoint, {
    ...options,
    method: "DELETE",
  });
}

export { API_URL };