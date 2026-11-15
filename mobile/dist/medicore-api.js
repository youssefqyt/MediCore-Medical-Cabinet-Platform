// MediCore Full-Stack API Client & Direct Dispatch Engine
const API_BASE = "http://localhost:5000/api";

let authToken = localStorage.getItem("medicore_token") || null;
let currentUser = JSON.parse(localStorage.getItem("medicore_user") || "null");

export function setSession(token, user) {
  authToken = token;
  currentUser = user;
  if (token) localStorage.setItem("medicore_token", token);
  else localStorage.removeItem("medicore_token");
  if (user) localStorage.setItem("medicore_user", JSON.stringify(user));
  else localStorage.removeItem("medicore_user");
}

export function getSession() {
  return { token: authToken, user: currentUser };
}

export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    // If running in sandbox without open port, fall back to programmatic local mock/in-memory bridge
    console.warn("Fetch fallback to in-browser storage/sync:", err.message);
    throw err;
  }
}
