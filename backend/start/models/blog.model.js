import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    excerpt: {
      type: String,
      default: ""
    },

    content: {
      type: String,
      required: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isPublished: {
      type: Boolean,
      default: false
    },

    featuredImage: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: "General",
      trim: true
    },

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    // Estimated reading time in minutes, computed from word count on save
    readingTime: {
      type: Number,
      default: 1
    },

    views: {
      type: Number,
      default: 0
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Full-text search index across title, excerpt, content, and tags
blogSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;