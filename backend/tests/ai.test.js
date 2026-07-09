import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Mocking GoogleGenAI SDK using ESM unstable_mockModule before importing app/models
// Exposed at module scope so individual tests can override the return value (e.g. refusals)
const mockGenerateContent = jest.fn().mockResolvedValue({
  text: JSON.stringify({
    sufficientContext: true,
    reason: "",
    title: "Mock AI Blog Post",
    excerpt: "This is a mock blog excerpt generated during testing.",
    content: "<p>Mock blog content in HTML format.</p>",
    imageKeywords: "mock, testing, ai"
  })
});

jest.unstable_mockModule("@google/genai", () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      constructor() {
        this.models = { generateContent: mockGenerateContent };
      }
    }
  };
});

// Dynamically import files so Jest can inject the mock first
const { default: app } = await import("../start/app.js");
const { default: User } = await import("../start/models/user.model.js");
const { default: AIPreset } = await import("../start/models/aiPreset.model.js");

describe("QuillForge AI Integration Test Suite", () => {
  let userCookie = "";
  const JWT_SECRET = process.env.JWT_SECRET || "egsrxdhcfgbhjdxfcghvjbknldrtfyuiop243546ftghmblikhjmfcv";

  const mockUserDoc = {
    _id: new mongoose.Types.ObjectId(),
    username: "aitester",
    email: "aitester@gmail.com",
    role: "user",
    aiQuota: {
      generationsCount: 0,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    save: jest.fn().mockResolvedValue(true)
  };

  const mockPresetDoc = {
    _id: new mongoose.Types.ObjectId(),
    userId: mockUserDoc._id,
    presetName: "Tech Tutorial Preset",
    blogType: "Tutorial",
    tone: "Professional",
    contextTemplate: "Mock template context data"
  };

  beforeAll(() => {
    // Configure environment mock keys
    process.env.GEMINI_API_KEY = "mock_key_for_testing";

    // Generate valid test token
    const token = jwt.sign(
      { _id: mockUserDoc._id.toString(), username: mockUserDoc.username, email: mockUserDoc.email, role: mockUserDoc.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    userCookie = `accessToken=${token}`;

    const createMockQuery = (resolveValue) => {
      const query = {
        exec: jest.fn().mockResolvedValue(resolveValue),
        then: jest.fn().mockImplementation((onResolve, onReject) => {
          return Promise.resolve(resolveValue).then(onResolve, onReject);
        })
      };
      query.select = jest.fn().mockReturnValue(query);
      query.sort = jest.fn().mockReturnValue(query);
      return query;
    };

    // Mock Mongoose model queries
    jest.spyOn(User, "findById").mockImplementation(() => {
      return createMockQuery(mockUserDoc);
    });

    jest.spyOn(AIPreset, "find").mockImplementation(() => {
      return createMockQuery([mockPresetDoc]);
    });

    jest.spyOn(AIPreset, "findOneAndUpdate").mockResolvedValue(mockPresetDoc);
    jest.spyOn(AIPreset, "findOneAndDelete").mockResolvedValue(mockPresetDoc);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("AI Content Generation & Quotas", () => {
    it("should successfully generate blog details when quota is within limits", async () => {
      const res = await request(app)
        .post("/api/v1/blogs/ai-generate")
        .set("Cookie", userCookie)
        .send({
          subject: "Building Rest APIs",
          tone: "Professional",
          blogType: "Tutorial",
          context: "Use Express.js and node-postgres"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Mock AI Blog Post");
      expect(res.body.data.excerpt).toBeDefined();
      expect(res.body.data.content).toBeDefined();
    });

    it("should block generation requests if user exceeds their monthly quota of 3", async () => {
      mockUserDoc.aiQuota.generationsCount = 3;
      try {
        const res = await request(app)
          .post("/api/v1/blogs/ai-generate")
          .set("Cookie", userCookie)
          .send({
            subject: "Any Subject To Write About",
            tone: "Casual",
            blogType: "Creative"
          });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Free plan limit reached");
      } finally {
        mockUserDoc.aiQuota.generationsCount = 0;
      }
    });

    it("should reject trivially short/gibberish subjects before calling the AI (Layer 1)", async () => {
      const res = await request(app)
        .post("/api/v1/blogs/ai-generate")
        .set("Cookie", userCookie)
        .send({
          subject: "hi lol",
          tone: "Casual",
          blogType: "Creative"
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/too short/i);
    });

    it("should reject when the AI judges the topic lacks sufficient context (Layer 2)", async () => {
      // Override the mock once: model returns a refusal instead of a fabricated blog
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          sufficientContext: false,
          reason: "The topic is too vague to write a meaningful article.",
          title: "",
          excerpt: "",
          content: "",
          imageKeywords: ""
        })
      });

      const res = await request(app)
        .post("/api/v1/blogs/ai-generate")
        .set("Cookie", userCookie)
        .send({
          subject: "something about stuff maybe",
          tone: "Casual",
          blogType: "Creative"
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/vague|context|substance/i);
    });
  });

  describe("Writing Presets CRUD Operations", () => {
    it("should fetch all user presets", async () => {
      const res = await request(app)
        .get("/api/v1/blogs/ai-presets")
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].presetName).toBe("Tech Tutorial Preset");
    });

    it("should successfully delete a user preset", async () => {
      const res = await request(app)
        .delete(`/api/v1/blogs/ai-presets/${mockPresetDoc._id}`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
