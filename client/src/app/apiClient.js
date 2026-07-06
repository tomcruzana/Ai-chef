const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api");
const GUEST_SESSION_KEY = "ai-chef-guest-session";

function getGuestSessionId() {
  const existingSessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = window.crypto?.randomUUID?.() || `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(GUEST_SESSION_KEY, sessionId);

  return sessionId;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Session": getGuestSessionId(),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed. Please try again.");
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body = {}) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
