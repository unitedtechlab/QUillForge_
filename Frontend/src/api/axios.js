import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8102";

const api = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  withCredentials: true,
});
console.log("BACKEND:", backendUrl);
export default api; 