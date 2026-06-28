/**
 * User Model
 * Stores user credentials and usage tracking
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },

    // Track daily predictions for rate limiting per user
    predictionsToday: {
      type: Number,
      default: 0,
    },

    // Reset predictionsToday each day via this timestamp
    lastPredictionDate: {
      type: String, // Store as "YYYY-MM-DD" for easy comparison
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto-added
  },
);

// ─── Hash password before saving ──────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if password field was modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method: compare password ────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: check + increment daily prediction count ─
userSchema.methods.canPredict = function () {
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const limit = parseInt(process.env.PREDICTIONS_PER_DAY || "5");

  // Reset counter if it's a new day
  if (this.lastPredictionDate !== today) {
    this.predictionsToday = 0;
    this.lastPredictionDate = today;
  }

  return this.predictionsToday < limit;
};

userSchema.methods.incrementPredictionCount = async function () {
  const today = new Date().toISOString().split("T")[0];

  if (this.lastPredictionDate !== today) {
    this.predictionsToday = 1;
    this.lastPredictionDate = today;
  } else {
    this.predictionsToday += 1;
  }

  await this.save();
};

export default mongoose.model("User", userSchema);
