// ============================================================================
// blog.controller.js — BLOG BUSINESS LOGIC
// ----------------------------------------------------------------------------
// Every function here is the final step of a request that matched a route in
// blog.routes.js. By the time these run, auth/quota/rate-limit middleware have
// already passed. Each controller reads req (params/body/user), talks to the
// Blog Mongoose model (blog.model.js) to touch MongoDB, and sends a JSON reply.
//
// Shared helpers used across the app:
//   asyncHandler  — wraps an async fn so thrown errors go to app.js's error handler
//   ApiError      — throwable error carrying an HTTP status code
//   ApiResponse   — standard { statusCode, data, message, success } envelope
// ============================================================================

import Blog from "../models/blog.model.js";                    // the Mongoose model = our door to the blogs collection
import { asyncHandler } from "../../utilities/asynchandler.js"; // error-forwarding wrapper
import { ApiError } from "../../utilities/errors.js";           // throw new ApiError(status, msg)
import { ApiResponse } from "../../utilities/response.js";      // consistent success envelope
import { uploadOnCloudinary } from "../../utilities/cloudinary.js"; // pushes an image buffer to Cloudinary
import sanitizeHtml from "sanitize-html";                       // strips dangerous HTML to prevent stored XSS

// Whitelist of HTML that is allowed to survive sanitization. Blog content is
// rich HTML (headings, lists, code blocks, links), but we must not allow
// <script> or event handlers, so anything not listed here is stripped out.
const ALLOWED_HTML = {
  allowedTags: ["p", "h2", "h3", "h4", "pre", "code", "ul", "ol", "li", "a", "strong", "em", "blockquote", "br", "hr", "span"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    code: ["class"],
    span: ["class"]
  },
  allowedSchemes: ["https", "http"]
};

// Estimate reading time in minutes from HTML content (avg 200 words/min, min 1).
// Called on create/update so each blog stores a "5 min read" style figure.
// Strips tags first so we count real words, not markup.
function estimateReadingTime(html) {
  const text = String(html || "").replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Normalize tags into a clean string array (accepts array or comma-separated string).
// The frontend may send tags as "react, node, api" OR ["react","node"] — this
// coerces either into a trimmed, non-empty array capped at 10 tags.
function normalizeTags(tags) {
  if (!tags) return [];
  const arr = Array.isArray(tags) ? tags : String(tags).split(",");
  return arr
    .map(t => String(t).trim())
    .filter(Boolean)
    .slice(0, 10); // cap at 10 tags
}

// POST /api/v1/blogs  (route: blog.routes.js → verifyjwt → createBlog)
// Creates a new blog owned by the logged-in user. Sanitizes the HTML, builds a
// URL-safe slug from the title, computes reading time, and saves the document.
const createBlog = asyncHandler(async (req, res) => {

  const {
    title,
    excerpt,
    content,
    isPublished = false,
    featuredImage = "",
    category = "General",
    tags = []
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
      category: category || "General",
      tags: normalizeTags(tags),
      readingTime: estimateReadingTime(safeContent),
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

// GET /api/v1/blogs  (route: blog.routes.js → optionalAuth → getAllBlogs)
// Lists blogs with optional ?q= search, ?category=, ?sort=popular, and
// ?page=/?limit= pagination. What each caller sees depends on req.user (set by
// optionalAuth): anonymous → published only; author → their drafts too; admin → all.
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

  // Optional category filter
  if (req.query.category && req.query.category !== "all") {
    filter.category = req.query.category;
  }

  // Optional full-text search across title/excerpt/content/tags
  const search = req.query.q?.trim();
  if (search) {
    filter.$text = { $search: search };
  }

  // Pagination (defaults: page 1, 30 per page). limit capped at 100.
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  // Sort: relevance when searching, newest otherwise; "popular" sorts by views
  let sort = { createdAt: -1 };
  if (search) sort = { score: { $meta: "textScore" } };
  else if (req.query.sort === "popular") sort = { views: -1 };

  const query = Blog.find(filter);
  if (search) query.select({ score: { $meta: "textScore" } });

  const [blogs, total] = await Promise.all([
    query.populate("author", "username role").sort(sort).skip(skip).limit(limit),
    Blog.countDocuments(filter)
  ]);

  return res.status(200).json({
    statusCode: 200,
    // `data` stays an array for backward compatibility with existing frontend code.
    data: blogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    },
    message: "Blogs fetched successfully",
    success: true
  });
});

// DELETE /api/v1/blogs/:id  (route: verifyjwt → deleteBlog)
// Removes a blog. Ownership/permission is enforced inside (only the author or an
// admin may delete), so a logged-in user cannot delete someone else's post.
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

// GET /api/v1/blogs/:id  (route: getBlogById — public, no auth)
// Fetches a single blog by its MongoDB id, used by the reader/detail page.
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

// PUT /api/v1/blogs/:id  (route: verifyjwt → updateBlog)
// Edits an existing blog. Only whitelisted fields are accepted (guards against
// mass-assignment), the slug is regenerated if the title changed, and reading
// time is recomputed only when the content itself changed.
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
  const { title, content, excerpt, isPublished, featuredImage, category, tags } = req.body;

  const safeContent = content ? sanitizeHtml(content, ALLOWED_HTML) : undefined;

  // Keep the slug in sync when the title changes
  let slug;
  if (title && title !== blog.title) {
    slug = title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      throw new ApiError(400, "Title must contain at least one ASCII character");
    }
  }

  // Recompute reading time only when content actually changed
  const readingTime = safeContent ? estimateReadingTime(safeContent) : undefined;

  let updatedBlog;
  try {
    updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        content: safeContent,
        excerpt,
        isPublished,
        featuredImage,
        category,
        tags: tags !== undefined ? normalizeTags(tags) : undefined,
        readingTime
      },
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

// PATCH /api/v1/blogs/:id/view  (route: viewRateLimiter → incrementView — public)
// Bumps a blog's view counter. Rate-limited to 1/min per IP (see blog.routes.js)
// so a single reader refreshing can't inflate the count.
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
// PATCH /api/v1/blogs/:id/like  (route: verifyjwt → toggleLike)
// Adds or removes the current user's id from the blog's likes array. Uses an
// atomic MongoDB update so two simultaneous likes can't corrupt the count.
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

// POST /api/v1/blogs/upload  (route: verifyjwt → multer → uploadBlogImage)
// Receives one image file (parsed into req.file by multer), pushes it to
// Cloudinary, and returns the hosted URL. The frontend stores that URL as the
// blog's featuredImage. This runs BEFORE createBlog in the editor's save flow.
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

// Export all controllers so blog.routes.js can wire them to their routes.
export { createBlog, getAllBlogs, deleteBlog, updateBlog, getBlogById, incrementView, toggleLike, uploadBlogImage };