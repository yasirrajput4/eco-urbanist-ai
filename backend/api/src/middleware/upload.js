/**
 * Upload Middleware
 * Validates file type and size before forwarding to FastAPI.
 * This mirrors the client-side validateImageFile() in helpers.js
 * but enforces it server-side where it cannot be bypassed.
 */

import multer from "multer";

// Store file in memory (as Buffer) so we can forward it to FastAPI
// via axios + form-data without writing to disk on the Express server.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedTypes.includes(file.mimetype)) {
    // Pass an error — multer will reject the upload
    return cb(
      new Error("Invalid file type. Only PNG and JPEG images are allowed."),
      false,
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB — matches helpers.js validateImageFile
  },
});
