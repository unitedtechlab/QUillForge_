import Blog from "../models/blog.model.js";
import { asyncHandler } from "../../utilities/asynchandler.js";
import { ApiError } from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";
import { uploadOnCloudinary } from "../../utilities/cloudinary.js";
import sanitizeHtml from "sanitize-html";

const ALLOWED_HTML = {
  allowedTags: ["p", "h2", "h3", "h4", "pre", "code", "ul", "ol", "li", "a", "strong", "em", "blockquote", "br", "hr", "span"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    code: ["class"],
    span: ["class"]
  },
  allowedSchemes: ["https", "http"]
};

const createBlog = asyncHandler(async (req, res) => {

  const {
    title,
    excerpt,
    content,
    isPublished = false,
    featuredImage = ""
  } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const safeContent = sanitizeHtml(content, ALLOWED_HTML);

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");  // strip non-ASCII chars that would break slugs

  if (!slug) {
    throw new ApiError(400, "Title must contain at least one ASCII character");
  }

  let blog;
  try {
    blog = await Blog.create({
      title,
      slug,
      excerpt,
      views: 0,
      content: safeContent,
      isPublished,
      featuredImage,
      author: req.user._id
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "A blog with this title already exists");
    }
    throw err;
  }

  const Blogdetails = await Blog.findById(blog._id)
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

  // Visibility rules:
  //  - anonymous:   published blogs only
  //  - logged in:   published blogs + their own drafts
  //  - admin:       everything (required for the moderation dashboard)
  let filter = { isPublished: true };
  if (req.user) {
    filter = req.user.role === "admin"
      ? {}
      : { $or: [{ isPublished: true }, { author: req.user._id }] };
  }

  const blogs = await Blog.find(filter)
    .populate("author", "username role")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      blogs,
      "Blogs fetched successfully"
    )
  );
});

const deleteBlog = asyncHandler(async (req, res) => {

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new ApiError(
      404,
      "Blog not found"
    );
  }

  if (req.user.role !== "admin" && blog.author.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this blog"
    );
  }

  await Blog.findByIdAndDelete(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Blog deleted successfully"
    )
  );
});

const getBlogById = asyncHandler(async (req, res) => {

  const blog = await Blog.findById(req.params.id).populate("author", "username email role");

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      blog,
      "Blog fetched successfully"
    )
  );
});

const updateBlog = asyncHandler(async (req, res) => {

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (req.user.role !== "admin" && blog.author.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this blog"
    );
  }

  // Whitelist only safe fields — prevents mass-assignment attacks
  const { title, content, excerpt, isPublished, featuredImage } = req.body;

  const safeContent = content ? sanitizeHtml(content, ALLOWED_HTML) : undefined;

  // Keep the slug in sync when the title changes
  let slug;
  if (title && title !== blog.title) {
    slug = title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      throw new ApiError(400, "Title must contain at least one ASCII character");
    }
  }

  let updatedBlog;
  try {
    updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, slug, content: safeContent, excerpt, isPublished, featuredImage },
      { new: true, runValidators: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "A blog with this title already exists");
    }
    throw err;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedBlog,
      "Blog updated"
    )
  );
});

const incrementView = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { views: blog.views }, "View counted")
  );
});

// toggleLike uses atomic $addToSet/$pull — no race condition possible
const toggleLike = asyncHandler(async (req, res) => {
  const existing = await Blog.findById(req.params.id).select("likes");
  if (!existing) {
    throw new ApiError(404, "Blog not found");
  }

  const userId = req.user._id;
  const alreadyLiked = existing.likes.some(id => id.toString() === userId.toString());

  // Atomic update — no race condition possible
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { likes: blog.likes.length, liked: !alreadyLiked },
      alreadyLiked ? "Like removed" : "Blog liked"
    )
  );
});

const uploadBlogImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const result = await uploadOnCloudinary(req.file.buffer);

  if (!result) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: result.secure_url
    }, "Image uploaded successfully")
  );
});

export { createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById, incrementView, toggleLike, uploadBlogImage };