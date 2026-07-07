import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000" // Express in dev
    : typeof window !== "undefined"
      ? window.location.origin
      : "");

const TOKEN_KEY = "eco_token:v1";
const USER_KEY = "eco_user:v1";

// In-memory cache variables initialized with versioned storage fallback
let tokenCache =
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
let userCache = null;

try {
  if (typeof window !== "undefined") {
    const cachedUser = localStorage.getItem(USER_KEY);
    userCache = cachedUser ? JSON.parse(cachedUser) : null;
  }
} catch {
  userCache = null;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Reads token seamlessly from cache memory
apiClient.interceptors.request.use((config) => {
  if (tokenCache) {
    config.headers.Authorization = `Bearer ${tokenCache}`;
  }
  return config;
});

// Clears cache immediately along with versioned localStorage on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      tokenCache = null;
      userCache = null;
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

  signup: async (name, email, password) => {
    try {
      const response = await apiClient.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      // Update cache alongside versioned storage
      tokenCache = response.data.token;
      userCache = response.data.user;

      localStorage.setItem(TOKEN_KEY, tokenCache);
      localStorage.setItem(USER_KEY, JSON.stringify(userCache));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      // Update cache alongside versioned storage
      tokenCache = response.data.token;
      userCache = response.data.user;

      localStorage.setItem(TOKEN_KEY, tokenCache);
      localStorage.setItem(USER_KEY, JSON.stringify(userCache));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    tokenCache = null;
    userCache = null;
  },

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

  // No disk access or JSON parsing on consecutive calls
  getCurrentUser: () => userCache,

  // O(1) instantaneous operational speed lookup
  isLoggedIn: () => !!tokenCache,

  // ── PREDICTION ──────────────────────────────────────────────

  generatePrediction: async (imageFile, inputImagePreview = null) => {
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      if (inputImagePreview) {
        formData.append("inputImagePreview", inputImagePreview);
      }

      const response = await apiClient.post("/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });

      return { success: true, data: response.data };
    } catch (error) {
      let errorMessage = "Prediction failed";

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. The server is taking too long to respond.";
      } else if (error.response?.status === 429) {
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
