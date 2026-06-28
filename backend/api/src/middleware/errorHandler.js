/**
 * Global Error Handler
 * Catches errors thrown by any route/middleware and returns
 * a consistent JSON error response.
 */

export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Multer file size / type errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Maximum size is 10MB." });
  }

  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(". ") });
  }

  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // JWT errors (caught by auth middleware, but just in case)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }

  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ error: "Token expired. Please log in again." });
  }

  // Fallback
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
  });
};
