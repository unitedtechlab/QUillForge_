import Blog from "../models/blog.model.js";
import { asyncHandler } from "../../utilities/asynchandler.js";
import { ApiError } from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";

const createBlog = asyncHandler(async (req, res) => {

    const {
        title,
        excerpt,
        content,
        isPublished
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
        slug,
        excerpt,
        content,
        isPublished,
        author: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            blog,
            "Blog created successfully"
        )
    );
});

export { createBlog };