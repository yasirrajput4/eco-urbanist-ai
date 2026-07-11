/**
 * LocalStorage utility for gallery management
 */

// Added :v1 to prevent data structure conflicts in the future
const GALLERY_KEY = "eco-urbanist-gallery:v1";

export const galleryStorage = {
  /**
   * Get all gallery items
   */
  getAll: () => {
    try {
      const data = localStorage.getItem(GALLERY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading gallery:", error);
      // Return empty array to recover from corrupt data
      return [];
    }
  },

  /**
   * Add a new item to the gallery
   */
  add: (item) => {
    try {
      const gallery = galleryStorage.getAll();
      const newItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...item,
      };
      gallery.unshift(newItem); // Add to beginning

      try {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
        return newItem;
      } catch (storageError) {
        if (
          storageError.name === "QuotaExceededError" ||
          storageError.code === 22 // legacy browsers
        ) {
          let trimmed = [...gallery];

          // Try progressively removing the oldest items until it fits
          while (trimmed.length > 1) {
            trimmed = trimmed.slice(0, -1);
            try {
              localStorage.setItem(GALLERY_KEY, JSON.stringify(trimmed));
              console.warn(
                "Gallery storage quota exceeded — removed oldest result(s) to make room.",
              );
              return newItem;
            } catch {
              // keep trimming
            }
          }

          console.error(
            "Error adding to gallery: storage quota exceeded even after trimming.",
          );
          return null;
        }

        throw storageError;
      }
    } catch (error) {
      console.error("Error adding to gallery:", error);
      return null;
    }
  },

  /**
   * Delete item by ID
   */
  delete: (id) => {
    try {
      const gallery = galleryStorage.getAll();
      const filtered = gallery.filter((item) => item.id !== id);
      localStorage.setItem(GALLERY_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting from gallery:", error);
      return false;
    }
  },

  /**
   * Clear all gallery items
   */
  clearAll: () => {
    try {
      localStorage.removeItem(GALLERY_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing gallery:", error);
      return false;
    }
  },

  /**
   * Get item by ID
   */
  getById: (id) => {
    try {
      const gallery = galleryStorage.getAll();
      return gallery.find((item) => item.id === id);
    } catch (error) {
      console.error("Error getting item:", error);
      return null;
    }
  },

  /**
   * Get gallery statistics
   */
  getStats: () => {
    try {
      const gallery = galleryStorage.getAll();
      if (gallery.length === 0) {
        return {
          totalImages: 0,
          averageImprovement: 0,
          totalTreesPlanted: 0,
        };
      }

      const totalTreesPlanted = gallery.reduce(
        (sum, item) => sum + (item.visualization?.trees_placed || 0),
        0,
      );

      const totalImprovement = gallery.reduce(
        (sum, item) => sum + (item.greenScores?.improvement || 0),
        0,
      );

      return {
        totalImages: gallery.length,
        averageImprovement: totalImprovement / gallery.length,
        totalTreesPlanted,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        totalImages: 0,
        averageImprovement: 0,
        totalTreesPlanted: 0,
      };
    }
  },
};
