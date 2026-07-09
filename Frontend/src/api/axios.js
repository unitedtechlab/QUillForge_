import axios from "axios";

// Configurable via .env → REACT_APP_BACKEND_BASE_URL (falls back to local dev backend)
export const backendUrl = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8102";

const api = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  withCredentials: true,
});

export default api;