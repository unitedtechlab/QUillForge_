import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { verifyadmin } from "../middlewares/admin.middleware.js";
import { verifyAiLimit } from "../middlewares/quota.middleware.js";
import { createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById, incrementView, toggleLike, uploadBlogImage } from "../controllers/blog.controller.js";
import { generateBlogContent, getUserPresets, deleteUserPreset } from "../controllers/ai.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// AI routes (Must be declared before /:id parameter matching)
router.post("/ai-generate", verifyjwt, verifyAiLimit, generateBlogContent);
router.get("/ai-presets", verifyjwt, getUserPresets);
router.delete("/ai-presets/:id", verifyjwt, deleteUserPreset);

router.post("/upload", verifyjwt, upload.single("image"), uploadBlogImage);
router.post("/", verifyjwt, createBlog);

router.get("/", getAllBlogs);

// Must be declared before /:id so Express does not treat "view"/"like" as an id param
router.patch("/:id/view", incrementView);
router.patch("/:id/like", verifyjwt, toggleLike);

router.get("/:id", getBlogById);
router.put("/:id", verifyjwt, updateBlog);
router.delete("/:id", verifyjwt, deleteBlog);

export default router;