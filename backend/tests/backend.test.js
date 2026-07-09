import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../start/app.js";
import User from "../start/models/user.model.js";
import Blog from "../start/models/blog.model.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "egsrxdhcfgbhjdxfcghvjbknldrtfyuiop243546ftghmblikhjmfcv";

// Helper to mock chainable mongoose queries
const mockQuery = (resolveValue) => {
  const query = {
    select: jest.fn().mockImplementation(() => query),
    populate: jest.fn().mockImplementation(() => query),
    sort: jest.fn().mockImplementation(() => query),
    skip: jest.fn().mockImplementation(() => query),
    limit: jest.fn().mockImplementation(() => query),
    lean: jest.fn().mockImplementation(() => query),
    exec: jest.fn().mockResolvedValue(resolveValue),
    then: jest.fn().mockImplementation((onResolve, onReject) => {
      return Promise.resolve(resolveValue).then(onResolve, onReject);
    }),
    catch: jest.fn().mockImplementation((onReject) => {
      return Promise.resolve(resolveValue).catch(onReject);
    })
  };
  return query;
};

describe("QuillForge Backend API Test Suite", () => {
  let userCookie = "";
  let adminCookie = "";
  const blogId = "65893b82cb123e4567890abc";

  const userCredentials = {
    username: "testuser",
    email: "testuser@gmail.com",
    password: "Password123!"
  };

  const mockUserDoc = {
    _id: new mongoose.Types.ObjectId(),
    username: userCredentials.username,
    email: userCredentials.email,
    role: "user",
    isPasswordCorrect: jest.fn().mockResolvedValue(true),
    generateAccessToken: jest.fn().mockImplementation(() => {
      return jwt.sign(
        { _id: mockUserDoc._id, email: mockUserDoc.email, username: mockUserDoc.username, role: mockUserDoc.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
    })
  };

  const mockAdminDoc = {
    _id: new mongoose.Types.ObjectId(),
    username: "adminuser",
    email: "adminuser@gmail.com",
    role: "admin",
    isPasswordCorrect: jest.fn().mockResolvedValue(true),
    generateAccessToken: jest.fn().mockImplementation(() => {
      return jwt.sign(
        { _id: mockAdminDoc._id, email: mockAdminDoc.email, username: mockAdminDoc.username, role: mockAdminDoc.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
    })
  };

  beforeAll(() => {
    // Mock Mongoose connection
    jest.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
    jest.spyOn(mongoose.connection, "close").mockResolvedValue(true);

    // User model mocks
    jest.spyOn(User, "findOne").mockImplementation((query) => {
      if (query.email === "adminuser@gmail.com" || query.username === "adminuser") {
        return mockQuery(mockAdminDoc);
      }
      if (query.email === userCredentials.email || query.username === userCredentials.username) {
        return mockQuery(mockUserDoc);
      }
      if (query.$or) {
        const hasMatch = query.$or.some(q => q.email === userCredentials.email || q.username === userCredentials.username);
        if (hasMatch) return mockQuery(mockUserDoc);
      }
      return mockQuery(null);
    });

    jest.spyOn(User, "create").mockImplementation((data) => {
      if (!data.username || !data.email || !data.password) {
        return Promise.reject(new Error("ValidationError"));
      }
      return Promise.resolve(mockUserDoc);
    });

    jest.spyOn(User, "deleteMany").mockResolvedValue({ deletedCount: 1 });
    
    jest.spyOn(User, "findById").mockImplementation((id) => {
      if (id && id.toString() === mockAdminDoc._id.toString()) {
        return mockQuery(mockAdminDoc);
      }
      return mockQuery(mockUserDoc);
    });

    // Blog model mocks
    const mockBlogDoc = {
      _id: blogId,
      title: "How to Build Robust Systems",
      slug: "how-to-build-robust-systems",
      excerpt: "verification guidelines",
      content: "<p>Building systems requires robust verification testing strategies...</p>",
      author: mockUserDoc._id,
      isPublished: true,
      views: 0,
      likes: [],
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(Blog, "create").mockResolvedValue(mockBlogDoc);
    jest.spyOn(Blog, "find").mockImplementation(() => mockQuery([mockBlogDoc]));
    jest.spyOn(Blog, "countDocuments").mockResolvedValue(1);
    jest.spyOn(Blog, "findOne").mockImplementation(() => mockQuery(null));
    jest.spyOn(Blog, "findById").mockImplementation(() => mockQuery(mockBlogDoc));
    
    jest.spyOn(Blog, "findByIdAndUpdate").mockImplementation((id, update) => {
      const updatedDoc = { ...mockBlogDoc };
      if (update.$inc && update.$inc.views) {
        updatedDoc.views += update.$inc.views;
      }
      if (update.title) {
        updatedDoc.title = update.title;
      }
      return mockQuery(updatedDoc);
    });

    jest.spyOn(Blog, "findByIdAndDelete").mockImplementation(() => mockQuery(mockBlogDoc));
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe("User Authentication & Verification Middleware", () => {
    it("should fail to register a user with missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send({
          username: "",
          email: "test@gmail.com",
          password: ""
        });
      expect(res.statusCode).toBe(400);
    });

    it("should register a new user successfully", async () => {
      // Mock findOne to return null (no existing user) for registration
      jest.spyOn(User, "findOne").mockImplementationOnce(() => mockQuery(null));
      const res = await request(app)
        .post("/api/v1/users/register")
        .send(userCredentials);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.createdUser.username).toBe(userCredentials.username);
    });

    it("should login user and return JWT access cookie", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: userCredentials.email,
          password: userCredentials.password
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
      
      // Store cookie for subsequent requests
      userCookie = res.headers["set-cookie"][0].split(";")[0];
    });

    it("should fetch current user using valid JWT cookie", async () => {
      const res = await request(app)
        .get("/api/v1/users/current-user")
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(userCredentials.username);
    });

    it("should reject current user access with missing JWT cookie", async () => {
      const res = await request(app)
        .get("/api/v1/users/current-user");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("Blog CRUD, Views, and Likes Operations", () => {
    const blogData = {
      title: "How to Build Robust Systems",
      content: "<p>Building systems requires robust verification testing strategies...</p>",
      excerpt: "verification guidelines",
      slug: "robust-systems-test",
      isPublished: true
    };

    it("should create a new blog post draft", async () => {
      const res = await request(app)
        .post("/api/v1/blogs")
        .set("Cookie", userCookie)
        .send(blogData);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(blogData.title);
    });

    it("should get all blog posts", async () => {
      const res = await request(app)
        .get("/api/v1/blogs");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should get a single blog post by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/blogs/${blogId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(blogData.title);
    });

    it("should atomically increment view count of blog post", async () => {
      let res = await request(app)
        .patch(`/api/v1/blogs/${blogId}/view`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.views).toBe(1);
    });

    it("should toggle user like status on post", async () => {
      // Like the post
      let res = await request(app)
        .patch(`/api/v1/blogs/${blogId}/like`)
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.liked).toBe(true);
    });

    it("should update an existing blog post", async () => {
      const res = await request(app)
        .put(`/api/v1/blogs/${blogId}`)
        .set("Cookie", userCookie)
        .send({
          title: "Building Extremely Robust Systems"
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Building Extremely Robust Systems");
    });

    it("should delete a blog post successfully", async () => {
      const res = await request(app)
        .delete(`/api/v1/blogs/${blogId}`)
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Role Authorization Guard Verification", () => {
    beforeAll(() => {
      // Generate real admin token with the exact mockAdminDoc _id
      const adminToken = jwt.sign(
        { _id: mockAdminDoc._id.toString(), username: mockAdminDoc.username, email: mockAdminDoc.email, role: mockAdminDoc.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      adminCookie = `accessToken=${adminToken}`;
    });

    it("should reject non-admin access to admin-only endpoint", async () => {
      const res = await request(app)
        .get("/api/v1/users/admin-test")
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(403);
    });

    it("should allow admin access to admin-only endpoint", async () => {
      const res = await request(app)
        .get("/api/v1/users/admin-test")
        .set("Cookie", adminCookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("You da real admin");
    });
  });

  describe("User Logout Process", () => {
    it("should logout user and clear authentication cookie", async () => {
      const res = await request(app)
        .post("/api/v1/users/logout")
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
