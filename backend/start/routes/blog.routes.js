import { Router } from "express";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import {verifyadmin} from "../middlewares/admin.middleware.js";
import {createBlog} from "../controllers/blog.controller.js";

const router = Router();

router.post("/", verifyjwt, verifyadmin, createBlog);

export default router;