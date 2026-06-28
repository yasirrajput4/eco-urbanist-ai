/**
 * Gallery Routes — replaces browser localStorage (storage.js)
 *
 * GET    /api/gallery          — get all saved results for logged-in user
 * DELETE /api/gallery/:id      — delete a specific result
 * DELETE /api/gallery          — clear all results for logged-in user
 * GET    /api/gallery/stats    — get aggregated stats (total, avg improvement, trees)
 */

import express from "express";
import Gallery from "../models/Gallery.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All gallery routes require auth
router.use(protect);

// ─── GET /api/gallery ─────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { sort = "newest" } = req.query;

    // Build sort object — mirrors the sort logic in Gallery.jsx
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      improvement: { "greenScores.improvement": -1 },
      trees: { "visualization.trees_placed": -1 },
    };

    const sortOption = sortMap[sort] || sortMap.newest;

    const items = await Gallery.find({ userId: req.user._id })
      .sort(sortOption)
      .lean(); // lean() returns plain JS objects (faster, less memory)

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/gallery/stats ───────────────────────────────────
// Must be defined BEFORE /:id to avoid "stats" being matched as an id
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await Gallery.aggregate([
      // Only this user's items
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          averageImprovement: { $avg: "$greenScores.improvement" },
          totalTreesPlanted: { $sum: "$visualization.trees_placed" },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: { totalImages: 0, averageImprovement: 0, totalTreesPlanted: 0 },
      });
    }

    const { totalImages, averageImprovement, totalTreesPlanted } = stats[0];

    res.json({
      success: true,
      data: {
        totalImages,
        averageImprovement: Math.round(averageImprovement * 10) / 10,
        totalTreesPlanted,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/gallery/:id ──────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Gallery.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensure user owns this item
    });

    if (!item) {
      return res.status(404).json({ error: "Gallery item not found." });
    }

    await item.deleteOne();

    res.json({ success: true, message: "Result deleted." });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/gallery ──────────────────────────────────────
// Clear ALL results for this user
router.delete("/", async (req, res, next) => {
  try {
    const result = await Gallery.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} results.`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
