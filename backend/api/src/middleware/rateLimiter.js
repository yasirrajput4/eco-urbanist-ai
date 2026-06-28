/**
 * Rate Limiter Middleware
 * Two levels:
 *  1. Global — applies to all routes (DoS protection)
 *  2. Prediction — stricter limit on the expensive /api/predict endpoint
 */

import rateLimit from "express-rate-limit";

// ─── 1. Global Rate Limiter ────────────────────────────────────
// 100 requests per 15 minutes per IP
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

// ─── 2. Prediction Rate Limiter ────────────────────────────────
// 10 prediction requests per 15 minutes per IP (on top of per-user
// daily limit enforced inside the prediction route handler)
export const predictionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: {
    error:
      "Too many prediction requests. Please wait 15 minutes before trying again.",
  },
});
