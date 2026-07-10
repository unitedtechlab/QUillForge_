// ============================================================================
// src/api/axios.js — PRECONFIGURED AXIOS INSTANCE
// ----------------------------------------------------------------------------
// Creates a single reusable Axios client that every component imports as `api`
// instead of using the bare axios library. Centralises base URL and cookie
// credentials so they never need to be repeated in individual API calls.
//
// USAGE IN COMPONENTS:
//   import api from "../api/axios";
//   const res = await api.get("/blogs");            // GET  /api/v1/blogs
//   const res = await api.post("/users/login", {}); // POST /api/v1/users/login
//
// BASE URL RESOLUTION:
//   Development  → http://localhost:8102/api/v1   (Express server via npm run dev)
//   Production   → https://api.quillforge.unitedtechlab.com/api/v1
//                  (set REACT_APP_BACKEND_BASE_URL in Vercel/Netlify env vars)
//
// withCredentials: true — tells the browser to include the httpOnly `accessToken`
//   cookie on every cross-origin request, so the backend's verifyjwt middleware
//   can read it without needing Authorization headers.
// ============================================================================

import axios from "axios";

// Reads from .env (local) or the hosting platform's env vars (production).
// Falls back to localhost so the app works out of the box after cloning.
export const backendUrl = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8102";

const api = axios.create({
  baseURL: `${backendUrl}/api/v1`, // all calls are relative to /api/v1
  withCredentials: true,           // include httpOnly accessToken cookie automatically
});

export default api;