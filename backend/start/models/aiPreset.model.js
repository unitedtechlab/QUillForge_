import mongoose from "mongoose";

const aiPresetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    presetName: {
      type: String,
      required: true,
      trim: true
    },
    blogType: {
      type: String,
      enum: ["Technical", "Tutorial", "Case Study", "Narrative", "Creative", "Opinion"],
      required: true
    },
    tone: {
      type: String,
      enum: ["Professional", "Casual", "Humorous", "Enthusiastic", "Academic"],
      required: true
    },
    contextTemplate: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Unique preset name per user
aiPresetSchema.index({ userId: 1, presetName: 1 }, { unique: true });

const AIPreset = mongoose.model("AIPreset", aiPresetSchema);

export default AIPreset;
