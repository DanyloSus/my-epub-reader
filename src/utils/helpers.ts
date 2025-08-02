/**
 * Generate a unique ID for bookmarks, highlights, etc.
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + "...";
};

/**
 * Extract text from CFI range
 */
export const extractTextFromCfi = (cfi: string, content: string): string => {
  // This is a simplified implementation
  // In a real app, you'd want to use the r2d2bc utilities for this
  return content.substring(0, 100) + "...";
};

/**
 * Get reading time estimate
 */
export const getReadingTimeEstimate = (
  wordCount: number,
  wordsPerMinute: number = 200
): number => {
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Convert progress percentage to human readable format
 */
export const formatProgress = (progress: number): string => {
  return `${Math.round(progress * 100)}%`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};
