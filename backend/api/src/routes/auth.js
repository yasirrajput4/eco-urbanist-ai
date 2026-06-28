/**
 * Auth Routes
 * POST /api/auth/signup  — register a new user
 * POST /api/auth/login   — login, receive JWT
 * GET  /api/auth/me      — get current user info (protected)
 */

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ─── Helper: sign JWT ──────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── POST /api/auth/signup ─────────────────────────────────────
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required." });
    }

    // Create user — password is hashed in User model's pre-save hook
    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error); // errorHandler catches duplicate email etc.
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Explicitly select password (it's excluded by default via select: false)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
// Protected — requires valid JWT
router.get("/me", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      predictionsToday:
        req.user.lastPredictionDate === today ? req.user.predictionsToday : 0,
      dailyLimit: parseInt(process.env.PREDICTIONS_PER_DAY || "5"),
    },
  });
});

export default router;
