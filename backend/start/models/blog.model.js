// ============================================================================
// models/blog.model.js — BLOG POST DATABASE SCHEMA
// ----------------------------------------------------------------------------
// Defines the shape of every blog document stored in the "blogs" MongoDB
// collection. Used by:
//   • blog.controller.js — all CRUD operations (createBlog, getBlogBySlug, etc.)
//   • user.controller.js — fetching blogs authored by a specific user
//
// RELATED ROUTES (blog.routes.js):
//   POST   /api/v1/blogs              → createBlog     (creates a new document)
//   GET    /api/v1/blogs              → getAllBlogs     (lists documents)
//   GET    /api/v1/blogs/:slug        → getBlogBySlug  (finds by unique slug)
//   PUT    /api/v1/blogs/:id          → updateBlog     (updates a document)
//   DELETE /api/v1/blogs/:id          → deleteBlog     (removes a document)
//   POST   /api/v1/blogs/:id/like     → toggleLike     (pushes/pulls from likes[])
//   POST   /api/v1/blogs/:id/view     → incrementView  (increments views counter)
// ============================================================================

import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,  // every blog must have a title
      trim: true       // strips leading/trailing whitespace before saving
    },

    // URL-safe identifier derived from the title (e.g. "my-blog-post").
    // Used in GET /blogs/:slug so the URL is human-readable instead of using MongoDB _id.
    slug: {
      type: String,
      required: true,
      unique: true,    // two posts can't share a slug — enforced at DB level
      trim: true
    },

    // Short description shown in blog card previews and search results.
    excerpt: {
      type: String,
      default: ""
    },

    // The full HTML body of the blog post (written in the rich-text editor).
    content: {
      type: String,
      required: true
    },

    // References the User who wrote the blog.
    // Populated with .populate("author") to get user details in responses.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",     // links to the User model
      required: true
    },

    // When false, the post is a private draft only visible to its author.
    // When true, it appears in public blog listings.
    isPublished: {
      type: Boolean,
      default: false
    },

    // Cloudinary URL of the cover photo (uploaded via POST /blogs or generated
    // by the Unsplash fetch inside ai.controller.js → fetchFeaturedImage).
    featuredImage: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: "General",
      trim: true
    },

    // Comma-separated values split into an array on save. Used for searching
    // and filtering. Indexed as part of the full-text search index below.
    tags: [
      {
        type: String,
        trim: true
      }
    ],

    // Estimated reading time in minutes, computed from word count on save
    // (see blog.controller.js → createBlog / updateBlog calculation).
    readingTime: {
      type: Number,
      default: 1
    },

    // Incremented by POST /blogs/:id/view via incrementView controller.
    // Rate-limited to prevent inflation (see blog.routes.js → viewLimiter).
    views: {
      type: Number,
      default: 0
    },

    // Array of User ObjectIds who have liked this post.
    // Toggled atomically with $addToSet / $pull in toggleLike controller
    // to avoid race conditions on concurrent like requests.
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true  // auto-adds createdAt and updatedAt fields to every document
  }
);

// Full-text search index across title, excerpt, content, and tags.
// Enables MongoDB's $text queries used in getAllBlogs → search filtering.
blogSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;