import Blog from "../models/blog.model.js";
import { asyncHandler } from "../../utilities/asynchandler.js";
import { ApiError } from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";

const createBlog = asyncHandler(async (req, res) => {

    const {
        title,
        excerpt,
        content,
        isPublished=false
    } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    const existingBlog = await Blog.findOne({ slug });

    if (existingBlog) {
        throw new ApiError(409, "Blog with same title already exists");
    }

    const blog = await Blog.create({
        title,
        slug, // auto generated 
        excerpt,
        views: 0,
        content,
        isPublished,
        author: req.user._id
    });

    const Blogdetails= await Blog.findById(blog._id)
    .populate("author", "username email");

    return res.status(201).json(
        new ApiResponse(
            201,
            Blogdetails,
            "Blog created successfully"
        )
    );
});

const getAllBlogs = asyncHandler(async (req, res) => {

    const blogs = await Blog.find()
        .populate("author", "username")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            blogs,
            "Blogs fetched successfully"
        )
    );
});

export { createBlog , getAllBlogs};