import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { verifyadmin } from "../middlewares/admin.middleware.js";
import { verifyAiLimit } from "../middlewares/quota.middleware.js";
import { createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById, incrementView, toggleLike, uploadBlogImage } from "../controllers/blog.controller.js";
import { generateBlogContent, getUserPresets, deleteUserPreset } from "../controllers/ai.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

// Max 1 AI generation per 15 seconds per IP — burst protection on top of monthly quota
// Skipped in test environment so quota tests receive 403 not 429
const aiRateLimiter = process.env.NODE_ENV === "test"
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 1000,
      max: 1,
      message: { success: false, message: "Please wait before generating another blog." },
      standardHeaders: true,
      legacyHeaders: false
    });

// Max 1 view increment per IP per blog per minute
const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { success: false, message: "View already counted." },
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

// AI routes (Must be declared before /:id parameter matching)
router.post("/ai-generate", verifyjwt, aiRateLimiter, verifyAiLimit, generateBlogContent);
router.get("/ai-presets", verifyjwt, getUserPresets);
router.delete("/ai-presets/:id", verifyjwt, deleteUserPreset);

router.post("/upload", verifyjwt, upload.single("image"), uploadBlogImage);
router.post("/", verifyjwt, createBlog);

router.get("/", getAllBlogs);

// Must be declared before /:id so Express does not treat "view"/"like" as an id param
router.patch("/:id/view", viewRateLimiter, incrementView);
router.patch("/:id/like", verifyjwt, toggleLike);

router.get("/:id", getBlogById);
router.put("/:id", verifyjwt, updateBlog);
router.delete("/:id", verifyjwt, deleteBlog);

export default router;