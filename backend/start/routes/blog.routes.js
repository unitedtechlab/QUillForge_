import { Router } from "express";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import {verifyadmin} from "../middlewares/admin.middleware.js";
import {createBlog} from "../controllers/blog.controller.js";

const router = Router();

router.post("/", verifyjwt, verifyadmin, createBlog);
// router.get("/", getAllBlogs);
// router.get("/:slug", getBlogBySlug);
// router.put("/:id", verifyjwt, verifyadmin, updateBlog);
// router.delete("/:id", verifyjwt, verifyadmin, deleteBlog);

export default router;