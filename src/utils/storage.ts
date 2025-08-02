/**
 * Storage utilities for persisting data
 */

const STORAGE_PREFIX = "epub-reader-";

export const storage = {
  /**
   * Save data to localStorage
   */
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  /**
   * Load data from localStorage
   */
  load: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  },

  /**
   * Clear all app data from localStorage
   */
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(STORAGE_PREFIX)
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
};
