import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.BACKEND_BASE_URL}/api/v1`,
  withCredentials: true,
});

export default api;