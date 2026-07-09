import { GoogleGenAI } from "@google/genai";
import { asyncHandler } from "../../utilities/asynchandler.js";
import { ApiResponse } from "../../utilities/response.js";
import { ApiError } from "../../utilities/errors.js";
import AIPreset from "../models/aiPreset.model.js";
import User from "../models/user.model.js";

// Helper to retrieve a cool image from Unsplash or fallback to retro placeholders
async function fetchFeaturedImage(keywords) {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!unsplashAccessKey) {
    // Graceful fallback to local retro pixel placeholders
    const placeholders = ["/typewriter-pixel.png", "/stars-pixel.png", "/hero-pixel.png"];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  try {
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&client_id=${unsplashAccessKey}&per_page=1&orientation=landscape`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Unsplash API error status: ${response.status}`);
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
  } catch (error) {
    console.error("Failed to fetch image from Unsplash, falling back:", error.message);
  }

  const placeholders = ["/typewriter-pixel.png", "/stars-pixel.png", "/hero-pixel.png"];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}

// Controller to compile blog details using Gemini 2.5 Flash
export const generateBlogContent = asyncHandler(async (req, res) => {
  const { subject, tone, blogType, context, savePreset, presetName } = req.body;

  if (!subject || !tone || !blogType) {
    throw new ApiError(400, "Subject, Tone, and Blog Type are required");
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new ApiError(500, "Gemini API key is not configured on the server.");
  }

  // Save preset configuration if checked
  if (savePreset && presetName) {
    await AIPreset.findOneAndUpdate(
      { userId: req.user._id, presetName },
      { blogType, tone, contextTemplate: context || "" },
      { upsert: true, new: true }
    );
  }

  // Initialize the Google GenAI SDK
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const systemInstruction = `
    You are a professional blog post generator for QuillForge, a retro-themed software development blogging platform.
    Your task is to write a high-quality blog article based ONLY on the user's provided metadata.
    
    CRITICAL INSTRUCTIONS:
    1. Do not output anything other than a single JSON object.
    2. Write the main body inside the 'content' field in clean HTML formatting (use elements like <p>, <h3>, <pre><code> for code blocks, <ul>, <li>). Avoid raw markdown in the content.
    3. Ensure the title is catchy, technical, and relevant to the subject.
    4. Provide a short 1-2 sentence article summary in the 'excerpt' field.
    5. Return a comma-separated list of 2-3 search query keywords (e.g. "retro computing terminal", "coding screen purple") in the 'imageKeywords' field.
    
    You must output exactly this JSON schema:
    {
      "title": "String",
      "excerpt": "String",
      "content": "String (HTML content)",
      "imageKeywords": "String"
    }
  `;

  const userPrompt = `
    Subject/Title idea: ${subject}
    Type of Blog: ${blogType}
    Tone of Blog: ${tone}
    Additional points/context: ${context || "None provided"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    const parsedBlog = JSON.parse(text);

    // Fetch cover image using the generated keywords
    const imageUrl = await fetchFeaturedImage(parsedBlog.imageKeywords || subject);

    // Success: Charge the free user quota increment
    const user = await User.findById(req.user._id);
    if (user && user.role !== "admin" && user.role !== "pro") {
      user.aiQuota.generationsCount += 1;
      await user.save();
    }

    return res.status(200).json(
      new ApiResponse(200, {
        title: parsedBlog.title,
        excerpt: parsedBlog.excerpt,
        content: parsedBlog.content,
        featuredImage: imageUrl
      }, "Blog compiled successfully via Gemini Flash")
    );
  } catch (error) {
    console.error("GenAI/Compilation failure:", error);
    throw new ApiError(500, `AI compilation failed: ${error.message}`);
  }
});

// Get user's saved writing presets
export const getUserPresets = asyncHandler(async (req, res) => {
  const presets = await AIPreset.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, presets, "Presets fetched successfully")
  );
});

// Delete a saved writing preset
export const deleteUserPreset = asyncHandler(async (req, res) => {
  const preset = await AIPreset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!preset) {
    throw new ApiError(404, "Preset not found");
  }
  return res.status(200).json(
    new ApiResponse(200, {}, "Preset deleted successfully")
  );
});
