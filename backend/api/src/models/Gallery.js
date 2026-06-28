/**
 * Gallery Model
 * Replaces the browser localStorage gallery (storage.js) with a
 * proper server-side MongoDB collection. Images are stored by their
 * output filename on FastAPI's server — NOT as base64, avoiding the
 * 5-10MB localStorage quota issue identified earlier in storage.js.
 */

import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    // Which user owns this result
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Filename of the generated image on FastAPI's server
    // e.g. "generated_20240614_123456_abc12345.png"
    outputFilename: {
      type: String,
      required: true,
    },

    // Small base64 thumbnail of INPUT image only (kept small — input
    // images are usually the original satellite photo before AI runs,
    // so we store just enough to show a preview in the gallery card).
    // For large inputs, truncate or omit on the client before sending.
    inputImagePreview: {
      type: String,
      default: null,
    },

    // Green coverage scores returned by FastAPI
    greenScores: {
      input: {
        green_score: Number,
        green_pixels: Number,
        total_pixels: Number,
      },
      output: {
        green_score: Number,
        green_pixels: Number,
        total_pixels: Number,
      },
      improvement: Number,
    },

    // Vegetation placement stats from FastAPI response
    visualization: {
      trees_placed: { type: Number, default: 0 },
      bushes_placed: { type: Number, default: 0 },
      grass_placed: { type: Number, default: 0 },
      total_placed: { type: Number, default: 0 },
    },

    // Metadata from FastAPI prediction response
    metadata: {
      processing_method: String,
      image_type: String,
      model_trained: Boolean,
    },
  },
  {
    timestamps: true, // createdAt = when result was saved
  },
);

// ─── Database Indexes ────────────────────────────────────────
// Optimize common queries: user-specific results, sorted by date
gallerySchema.index({ userId: 1, createdAt: -1 });
gallerySchema.index({ userId: 1, "greenScores.improvement": -1 });
gallerySchema.index({ userId: 1, "visualization.trees_placed": -1 });

export default mongoose.model("Gallery", gallerySchema);
