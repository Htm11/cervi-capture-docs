
/**
 * Utility functions for handling images
 */

/**
 * Process base64 image data to ensure it's in the correct format
 */
export const processBase64Image = (imageBase64: string): string | null => {
  try {
    if (!imageBase64) {
      console.error('No image data provided');
      return null;
    }
    
    // If the image already has the data URI prefix, extract just the base64 part
    let base64Data = imageBase64;
    if (base64Data.includes(',')) {
      base64Data = imageBase64.split(',')[1];
    }
    
    if (!base64Data) {
      console.error('Invalid base64 data');
      return null;
    }
    
    return base64Data;
  } catch (error) {
    console.error('Error processing base64 image:', error);
    return null;
  }
};

/**
 * Create a File object from base64 data
 */
export const createFileFromBase64 = async (
  base64Data: string,
  fileName: string
): Promise<File | null> => {
  try {
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`)
      .then(res => res.blob());
    
    return new File([blob], fileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error creating file from base64:', error);
    return null;
  }
};

/**
 * Validate patient ID format (UUID)
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};
