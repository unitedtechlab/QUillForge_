// ============================================================================
// src/App.jsx — ROOT COMPONENT & CLIENT-SIDE ROUTING
// ----------------------------------------------------------------------------
// The top-level component. Wraps the entire application in BrowserRouter and
// defines all URL routes. Rendered by index.jsx → createRoot.
//
// ROUTE MAP:
//   /           → Home          — Public landing page (hero, features, blog feed preview)
//   /login      → Login         — Credential or Google OAuth login form
//   /register   → Register      — New user account creation form
//   /dashboard  → Dashboard     — Authenticated user's personal writing dashboard
//   /admin      → AdminDashboard— Admin-only view with platform-wide analytics & management
//   /blog/:id   → BlogDetails   — Public single blog post reader (works by MongoDB _id)
//
// GLOBAL UI OVERLAYS (rendered outside <Routes> so they apply to every page):
//   .crt-overlay  — Subtle scanline effect (CSS in index.css)
//   .noise-overlay — Film grain / noise texture (CSS in index.css)
//
// AUTHENTICATION NOTES:
//   Route guards are NOT enforced here by React Router — each dashboard page
//   calls GET /api/v1/users/current-user on mount and redirects to / if the
//   user is not authenticated or does not have the required role.
// ============================================================================

import {BrowserRouter, Routes, Route} from "react-router-dom";


import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/admin_dashboard";
import BlogDetails from "./pages/BlogDetails";



function App() {
  return (
    <>
      <div className="crt-overlay" />
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}


export default App;