
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

/**
 * Preload an image to ensure it's in the browser cache
 */
export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      console.error('Failed to preload image:', url);
      resolve(false);
    };
    img.src = url;
  });
};

/**
 * Debug an image URL by logging its components
 */
export const debugImageUrl = (url: string): void => {
  if (!url) {
    console.log('Image URL is empty');
    return;
  }
  
  try {
    console.log('Image URL:', url);
    const parsedUrl = new URL(url);
    console.log('Protocol:', parsedUrl.protocol);
    console.log('Host:', parsedUrl.host);
    console.log('Pathname:', parsedUrl.pathname);
    console.log('Search params:', parsedUrl.search);
  } catch (error) {
    console.error('Invalid URL format:', url, error);
  }
};
