import Blog from "../models/blog.model.js";
import { asyncHandler } from "../../utilities/asynchandler.js";
import { ApiError } from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";
import { uploadOnCloudinary } from "../../utilities/cloudinary.js";

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
    featuredImage,
    author: req.user._id
  });

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

  const blogs = await Blog.find()
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

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { title, content, excerpt, isPublished, featuredImage },
    { new: true, runValidators: true }
  );

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

// explaination of togglelike is as follows : 
// togglelike is used to like or unlike a blog post.
// it takes the id of the blog post as a parameter.
// it checks if the blog post is liked by the user.
// if the blog post is liked by the user, it removes the like.
// if the blog post is not liked by the user, it adds the like.
// it returns the number of likes and the liked status.

const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  const userId = req.user._id.toString();
  const alreadyLiked = blog.likes.some(id => id.toString() === userId);

  if (alreadyLiked) {
    blog.likes = blog.likes.filter(id => id.toString() !== userId);
  } else {
    blog.likes.push(req.user._id);
  }
  // the above if else function works as follows :
  // if the blog is already liked by the user, it removes the like.
  // if the blog is not liked by the user, it adds the like.

  await blog.save();

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