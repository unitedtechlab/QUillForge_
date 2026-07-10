// ============================================================================
// models/aiPreset.model.js — AI WRITING PRESET DATABASE SCHEMA
// ----------------------------------------------------------------------------
// Stores named configuration templates that a user can save from the AI
// Assistant page. A preset bundles a blog type, tone, and context template
// together under a memorable name so the user doesn't have to re-fill the
// same settings each time.
//
// Used by:
//   • ai.controller.js → generateBlogContent  — saves preset if savePreset=true
//   • ai.controller.js → getUserPresets       — lists user's saved presets
//   • ai.controller.js → deleteUserPreset     — deletes a specific preset
//
// RELATED ROUTES (blog.routes.js — prefixed under /blogs because it shares auth):
//   GET    /api/v1/blogs/ai-presets        → getUserPresets    (list all presets)
//   DELETE /api/v1/blogs/ai-presets/:id    → deleteUserPreset  (remove one preset)
//   POST   /api/v1/blogs/generate          → generateBlogContent (optionally saves preset)
//
// FRONTEND: AIAssistantPage.jsx reads these presets for the "Select Preset"
// dropdown, and auto-fills blogType, tone, and contextTemplate when selected.
// ============================================================================

import mongoose from "mongoose";

const aiPresetSchema = new mongoose.Schema(
  {
    // The user this preset belongs to. Presets are always private — users can
    // only see and manage their own presets (enforced by controller queries with req.user._id).
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // links to User model
      required: true
    },

    // Human-readable label for this preset (e.g. "My Tech Blog Style").
    // Combined with userId in the compound unique index below so the same name
    // can exist for different users but NOT twice for the same user.
    presetName: {
      type: String,
      required: true,
      trim: true
    },

    // Controls the structural format of the Gemini prompt.
    // Maps to the "Blog Type" dropdown in AIAssistantPage.jsx.
    blogType: {
      type: String,
      enum: ["Technical", "Tutorial", "Case Study", "Narrative", "Creative", "Opinion"],
      required: true
    },

    // Sets the writing style/voice in the Gemini prompt.
    // Maps to the "Tone" dropdown in AIAssistantPage.jsx.
    tone: {
      type: String,
      enum: ["Professional", "Casual", "Humorous", "Enthusiastic", "Academic"],
      required: true
    },

    // Optional free-text field pre-filled into the "Additional Context" textarea.
    // Sent as part of the user prompt in ai.controller.js → generateBlogContent.
    contextTemplate: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }  // createdAt / updatedAt auto-managed
);

// Compound unique index: the same preset name cannot appear twice for the
// same user. Uses findOneAndUpdate with { upsert: true } in ai.controller.js
// so saving a preset with an existing name UPDATES it rather than erroring.
aiPresetSchema.index({ userId: 1, presetName: 1 }, { unique: true });

const AIPreset = mongoose.model("AIPreset", aiPresetSchema);

export default AIPreset;

