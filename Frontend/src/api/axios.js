import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_BASE_URL}/api/v1`,
  withCredentials: true,
});
console.log("BACKEND:", process.env.REACT_APP_BACKEND_BASE_URL);
console.log("REACT:", process.env.REACT_APP_BACKEND_BASE_URL);
export default api; 