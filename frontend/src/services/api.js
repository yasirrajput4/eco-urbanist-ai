/**
 * API Service for Eco-Urbanist AI
 *
 * CHANGED: Now points to Express backend (Node.js) instead of
 * FastAPI directly. Express handles auth, rate limiting, and gallery
 * storage, then proxies the image to FastAPI internally.
 *
 * OLD: React → FastAPI (port 8000)
 * NEW: React → Express (port 3000) → FastAPI (port 8000)
 */

import axios from "axios";

// CHANGED: was VITE_API_URL pointing to FastAPI (8000)
// Now points to Express backend (3000)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000" // Express in dev
    : typeof window !== "undefined"
      ? window.location.origin
      : "");

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ADDED: Attach JWT token to every request automatically
// Token is stored in localStorage after login/signup
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("eco_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ADDED: If token is expired/invalid, clear it and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("eco_token");
      localStorage.removeItem("eco_user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * API Service Object
 */
const api = {
  // ── AUTH ────────────────────────────────────────────────────

  // ADDED: Signup
  signup: async (name, email, password) => {
    try {
      const response = await apiClient.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      // Save token + user to localStorage
      localStorage.setItem("eco_token", response.data.token);
      localStorage.setItem("eco_user", JSON.stringify(response.data.user));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // ADDED: Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("eco_token", response.data.token);
      localStorage.setItem("eco_user", JSON.stringify(response.data.user));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // ADDED: Logout
  logout: () => {
    localStorage.removeItem("eco_token");
    localStorage.removeItem("eco_user");
  },

  // ADDED: Get current logged-in user
  getMe: async () => {
    try {
      const response = await apiClient.get("/api/auth/me");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // ADDED: Check if user is logged in (reads from localStorage)
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("eco_user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn: () => !!localStorage.getItem("eco_token"),

  // ── PREDICTION ──────────────────────────────────────────────

  /**
   * CHANGED: was posting directly to FastAPI /api/predict
   * Now posts to Express /api/predict which:
   *   - checks JWT auth
   *   - checks daily limit
   *   - forwards to FastAPI
   *   - saves result to MongoDB gallery
   *   - returns same response shape as before + galleryId
   *
   * ADDED: inputImagePreview param — small base64 thumbnail of input
   * image sent as a form field so Express can save it to MongoDB
   * (replaces the full base64 that was causing localStorage overflow)
   */
  generatePrediction: async (imageFile, inputImagePreview = null) => {
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      // Send preview thumbnail if provided (keep it small — resize before sending)
      if (inputImagePreview) {
        formData.append("inputImagePreview", inputImagePreview);
      }

      const response = await apiClient.post("/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 min for AI inference
      });

      return { success: true, data: response.data };
    } catch (error) {
      let errorMessage = "Prediction failed";

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. The server is taking too long to respond.";
      } else if (error.response?.status === 429) {
        // Daily limit or IP rate limit
        errorMessage = error.response.data?.error || "Rate limit exceeded.";
      } else if (error.response) {
        errorMessage = error.response?.data?.error || error.response.statusText;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  },

  // ── GALLERY ─────────────────────────────────────────────────
  // CHANGED: these now hit Express /api/gallery (MongoDB)
  // instead of reading/writing to localStorage via storage.js

  getGallery: async (sort = "newest") => {
    try {
      const response = await apiClient.get(`/api/gallery?sort=${sort}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  getGalleryStats: async () => {
    try {
      const response = await apiClient.get("/api/gallery/stats");
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  deleteGalleryItem: async (id) => {
    try {
      await apiClient.delete(`/api/gallery/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  clearGallery: async () => {
    try {
      await apiClient.delete("/api/gallery");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // ── DOWNLOAD ────────────────────────────────────────────────
  // CHANGED: download now goes through Express proxy so React
  // doesn't need to know FastAPI's URL

  getDownloadUrl: (filename) => {
    return `${API_BASE_URL}/api/predict/download/${filename}`;
  },

  downloadImage: async (filename) => {
    try {
      const url = api.getDownloadUrl(filename);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ── HEALTH ──────────────────────────────────────────────────
  getHealth: async () => {
    try {
      const response = await apiClient.get("/api/health");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default api;
