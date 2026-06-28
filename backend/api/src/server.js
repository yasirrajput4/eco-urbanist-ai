/**
 * Express Server Entry Point
 * Eco-Urbanist AI - Node.js Middleware Layer
 *
 * Architecture:
 * React → Express (auth, rate limit, gallery) → FastAPI (AI inference)
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import predictionRoutes from "./routes/prediction.js";
import galleryRoutes from "./routes/gallery.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Database ────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — applies to all routes
app.use(globalRateLimiter);

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes); // login, signup, me
app.use("/api/predict", predictionRoutes); // proxies to FastAPI
app.use("/api/gallery", galleryRoutes); // CRUD for saved results

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "eco-urbanist-express",
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
  console.log(`🐍 Proxying AI requests to: ${process.env.FASTAPI_URL}`);
});
