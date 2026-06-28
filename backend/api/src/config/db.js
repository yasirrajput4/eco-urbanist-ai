/**
 * MongoDB Connection
 * Uses Mongoose to connect to MongoDB Atlas (or local instance)
 */

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit if DB fails — app cannot run without it
  }
};
