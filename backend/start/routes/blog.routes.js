import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { verifyadmin } from "../middlewares/admin.middleware.js";
import { createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById, incrementView, toggleLike } from "../controllers/blog.controller.js";

const router = Router();

router.post("/", verifyjwt, createBlog);

router.get("/", getAllBlogs);

// Must be declared before /:id so Express does not treat "view"/"like" as an id param
router.patch("/:id/view", incrementView);
router.patch("/:id/like", verifyjwt, toggleLike);

router.get("/:id", getBlogById);
router.put("/:id", verifyjwt, updateBlog);
router.delete("/:id", verifyjwt, deleteBlog);

export default router;