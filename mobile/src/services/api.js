import { Platform } from "react-native";

// Set EXPO_PUBLIC_API_URL to your computer's LAN address for a real phone,
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.25:5000/api
const fallbackUrl = Platform.OS === "android" ? "http://10.0.2.2:5000/api" : "http://localhost:5000/api";
export const API_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;
let accessToken = null;
export const setAccessToken = token => { accessToken = token; };
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...options.headers },
    });
  } catch {
    throw new ApiError("We could not connect to the server. Check your connection and try again.", 0, "NETWORK_ERROR");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status >= 500
      ? "The service is temporarily unavailable. Please try again shortly."
      : body.message || "Please check your information and try again.";
    throw new ApiError(message, response.status, body.code);
  }
  return body;
}
export const loginRequest = input => request("/auth/login", { method: "POST", body: JSON.stringify(input) });
export const registerRequest = input => request("/auth/register", { method: "POST", body: JSON.stringify(input) });
