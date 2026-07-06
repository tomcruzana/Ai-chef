const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api");
const GUEST_SESSION_KEY = "ai-chef-guest-session";

function createGuestSessionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getGuestSessionId() {
  const existingSessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createGuestSessionId();
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
    const error = new Error(data?.message || "Request failed. Please try again.");
    error.data = data;
    error.status = response.status;
    throw error;
  }

  if (data === null) {
    throw new Error("The server returned an empty response. Check that the PHP server and MySQL database are running.");
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
