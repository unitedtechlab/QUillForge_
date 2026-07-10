// ============================================================================
// blog.routes.js — ROUTING TABLE FOR EVERYTHING UNDER /api/v1/blogs
// ----------------------------------------------------------------------------
// app.js mounts this router at /api/v1/blogs. Each line below maps an HTTP
// method + path to a chain of middleware and finally a controller function.
//
// How to read a route line:
//     router.<method>("<path>", ...middleware, controllerFunction)
// The request passes through each middleware in order; any of them can reject
// it (e.g. verifyjwt throws 401). If all pass, the controller runs and sends
// the response. Controllers live in ../controllers/blog.controller.js and
// ../controllers/ai.controller.js.
// ============================================================================

import { Router } from "express";
import rateLimit from "express-rate-limit";
// Auth middleware: verifyjwt = must be logged in; optionalAuth = attach user if present but never block.
import { verifyjwt, optionalAuth } from "../middlewares/auth.middleware.js";
import { verifyadmin } from "../middlewares/admin.middleware.js";
// Quota middleware: blocks AI generation once a user has hit their monthly allowance.
import { verifyAiLimit } from "../middlewares/quota.middleware.js";
// The controllers that actually implement each blog operation.
import { createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById, incrementView, toggleLike, uploadBlogImage } from "../controllers/blog.controller.js";
// AI controllers (blog generation + saved prompt presets) live in a separate file.
import { generateBlogContent, getUserPresets, deleteUserPreset } from "../controllers/ai.controller.js";
// Multer parses multipart/form-data so we can receive uploaded image files.
import { upload } from "../middlewares/multer.middleware.js";

// Burst protection for AI generation: at most 1 request per 15s per IP. This sits
// ON TOP OF the monthly quota (verifyAiLimit) — the quota caps total usage, this
// stops rapid-fire spamming. Disabled under test so the quota tests can assert a
// 403 (quota) instead of accidentally hitting a 429 (rate limit).
const aiRateLimiter = process.env.NODE_ENV === "test"
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 1000,
      max: 1,
      message: { success: false, message: "Please wait before generating another blog." },
      standardHeaders: true,
      legacyHeaders: false
    });

// Prevents view-count inflation: an IP can only bump a blog's view count once per minute.
const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { success: false, message: "View already counted." },
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

// --- AI routes ---
// IMPORTANT ORDERING: these specific paths are declared BEFORE the "/:id" routes
// further down. Express matches top-to-bottom, so if "/:id" came first it would
// swallow "ai-presets" as if "ai-presets" were a blog id.
//
// POST /ai-generate flow: verifyjwt (must be logged in) → aiRateLimiter (burst
// guard) → verifyAiLimit (monthly quota) → generateBlogContent (calls Groq).
router.post("/ai-generate", verifyjwt, aiRateLimiter, verifyAiLimit, generateBlogContent);
router.get("/ai-presets", verifyjwt, getUserPresets);        // list the logged-in user's saved AI prompt presets
router.delete("/ai-presets/:id", verifyjwt, deleteUserPreset); // delete one preset by id

// POST /upload: verifyjwt → multer parses a single "image" field → uploadBlogImage
// pushes it to Cloudinary and returns the hosted URL. The frontend calls this
// before create so the blog can store a featuredImage URL.
router.post("/upload", verifyjwt, upload.single("image"), uploadBlogImage);

// POST /  (create a blog): must be logged in; createBlog persists it and returns it.
router.post("/", verifyjwt, createBlog);

// GET /  (list blogs): uses optionalAuth (NOT verifyjwt) so the route stays public.
// If a valid token is present, req.user is attached and getAllBlogs will also
// include that user's own drafts (and everything, for admins).
router.get("/", optionalAuth, getAllBlogs);

// PATCH /:id/view and /:id/like are declared BEFORE GET /:id for the same
// ordering reason as the AI routes — otherwise "view"/"like" could be read as an id.
router.patch("/:id/view", viewRateLimiter, incrementView); // public: bump view count (rate-limited)
router.patch("/:id/like", verifyjwt, toggleLike);          // logged-in: like/unlike a blog

// --- Single-blog routes (parameterized by :id) ---
router.get("/:id", getBlogById);              // public: read one blog
router.put("/:id", verifyjwt, updateBlog);    // logged-in: edit a blog (author/admin checked in controller)
router.delete("/:id", verifyjwt, deleteBlog); // logged-in: delete a blog

export default router; // mounted at /api/v1/blogs in app.js
