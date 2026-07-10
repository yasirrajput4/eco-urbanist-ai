/**
 * Prediction Routes - FIXED
 * POST /api/predict — receive image, validate, check daily limit,
 * forward to FastAPI, save result to gallery DB
 */

import express from "express";
import axios from "axios";
import FormData from "form-data";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { predictionRateLimiter } from "../middleware/rateLimiter.js";
import Gallery from "../models/Gallery.js";

const router = express.Router();

// ─── POST /api/predict ────────────────────────────────────────
router.post(
  "/",
  predictionRateLimiter, // IP-based rate limit
  protect, // JWT auth
  upload.single("file"), // multer validates file type + size
  async (req, res, next) => {
    try {
      // ── 1. Check daily prediction limit ──────────────────────
      if (!req.user.canPredict()) {
        const limit = parseInt(process.env.PREDICTIONS_PER_DAY || "5");
        return res.status(429).json({
          error: `Daily limit reached. You can generate ${limit} images per day. Try again tomorrow.`,
          predictionsToday: req.user.predictionsToday,
          dailyLimit: limit,
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Please upload an image file." });
      }

      // ── 2. Build multipart form to forward to FastAPI ─────────
      const form = new FormData();
      form.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // ── 3. Forward to FastAPI ─────────────────────────────────
      const fastApiUrl = `${process.env.FASTAPI_URL}/api/predict`;

      let fastApiResponse;
      try {
        fastApiResponse = await axios.post(fastApiUrl, form, {
          headers: form.getHeaders(),
          timeout: 300_000, // 5 min — GAN inference can be slow
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      } catch (axiosError) {
        const message =
          axiosError.response?.data?.detail ||
          axiosError.message ||
          "AI inference service unavailable";
        return res.status(502).json({ error: message });
      }

      const result = fastApiResponse.data;

      // ── 4. Increment user's daily prediction count ────────────
      await req.user.incrementPredictionCount();

      // ── 5. Save result to Gallery (MongoDB) ───────────────────
      const galleryEntry = await Gallery.create({
        userId: req.user._id,
        outputFilename: result.output_filename,
        inputImagePreview: req.body.inputImagePreview || null, // Optional small base64 string
        greenScores: result.green_scores,
        visualization: result.visualization || {},
        metadata: result.metadata || {},
      });

      const protocol = req.protocol;
      const host = req.get("host");
      const expressBaseUrl = `${protocol}://${host}`;

      const sliderInputImage = req.body.inputImagePreview || null;

      // Output (After) Image fallback target: Dynamic streaming URL creation
      const sliderOutputImage = `${expressBaseUrl}/api/predict/download/${result.output_filename}`;

      res.json({
        ...result,
        galleryId: galleryEntry._id,
        predictionsToday: req.user.predictionsToday,
        dailyLimit: parseInt(process.env.PREDICTIONS_PER_DAY || "5"),
        inputImage: sliderInputImage,
        outputImage: sliderOutputImage,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET /api/predict/download/:filename ──────────────────────
// Fixed proxy routing for streaming images back seamlessly
router.get("/download/:filename", async (req, res, next) => {
  try {
    const { filename } = req.params;
    const fastApiUrl = `${process.env.FASTAPI_URL}/api/download/${filename}`;

    const response = await axios.get(fastApiUrl, {
      responseType: "stream",
      timeout: 30_000,
    });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "image/png",
    );
    // Inline delivery is better for sliders than attachment
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    response.data.pipe(res);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Image not found on AI server." });
    }
    next(error);
  }
});

export default router;
