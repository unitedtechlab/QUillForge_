import { Router } from "express";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import {verifyadmin} from "../middlewares/admin.middleware.js";
import {createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById} from "../controllers/blog.controller.js";

const router = Router();

router.post("/", verifyjwt, verifyadmin, createBlog);
// this comes from createblog or edit blog (from admindashboard as of now ) 

router.get("/", getAllBlogs);
// this comes from manageblogs function first step which is fetchblogs function to get all blogs .

// router.get("/:slug", getBlogBySlug);
router.get("/:id", getBlogById);
router.put("/:id", verifyjwt, verifyadmin, updateBlog);
 router.delete("/:id", verifyjwt, verifyadmin, deleteBlog);

export default router;