
/**
 * Utility functions for image handling
 */

/**
 * Check if a URL is a valid image URL (not broken)
 * This function is useful for pre-checking image URLs before displaying them
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image URL:', error);
    return false;
  }
};

/**
 * Get a fallback image URL if the original is not available
 */
export const getFallbackImageUrl = (): string => {
  return '/placeholder.svg';
};
