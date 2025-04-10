/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns Promise that resolves to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates if a file is an image and within size limits
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns Object with validation result and error message if any
 */
export const validateImage = (file: File, maxSizeMB = 5): { valid: boolean; message?: string } => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'File must be an image' };
  }

  // Check file size (default max 5MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `Image size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Resizes an image to a maximum width/height while maintaining aspect ratio
 * @param base64 The base64 string of the image
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @param quality JPEG quality (0-1), lower values mean smaller file size
 * @returns Promise that resolves to a resized base64 string
 */
export const resizeImage = (
  base64: string, 
  maxWidth = 800, 
  maxHeight = 600,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Use a lower quality setting to reduce file size
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Error loading image'));
  });
};

/**
 * Compresses an image to ensure it's below a certain file size limit
 * @param base64 The base64 string of the image
 * @param maxSizeKB Maximum file size in KB
 * @returns Promise that resolves to a compressed base64 string
 */
export const compressImageToMaxSize = async (
  base64: string,
  maxSizeKB = 500
): Promise<string> => {
  // Start with reasonable dimensions and quality
  let currentQuality = 0.7;
  let maxWidth = 800;
  let maxHeight = 600;
  let compressedImage = await resizeImage(base64, maxWidth, maxHeight, currentQuality);
  
  // Function to estimate base64 size in KB
  const getBase64SizeKB = (base64String: string): number => {
    // Remove data URL header (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.split(',')[1];
    // Base64 encodes 3 bytes into 4 characters
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes / 1024;
  };
  
  let currentSizeKB = getBase64SizeKB(compressedImage);
  console.log(`Initial compressed size: ${currentSizeKB.toFixed(2)}KB`);
  
  // If the image is still too large, progressively reduce quality and dimensions
  let attempts = 0;
  const maxAttempts = 5; // Prevent infinite loops
  
  while (currentSizeKB > maxSizeKB && attempts < maxAttempts) {
    attempts++;
    
    // Reduce quality first
    if (currentQuality > 0.3) {
      currentQuality -= 0.1;
    } else {
      // If quality is already low, reduce dimensions
      maxWidth = Math.round(maxWidth * 0.8);
      maxHeight = Math.round(maxHeight * 0.8);
    }
    
    compressedImage = await resizeImage(base64, maxWidth, maxHeight, currentQuality);
    currentSizeKB = getBase64SizeKB(compressedImage);
    
    console.log(`Compression attempt ${attempts}: ${currentSizeKB.toFixed(2)}KB (Quality: ${currentQuality.toFixed(1)}, Dimensions: ${maxWidth}x${maxHeight})`);
  }
  
  return compressedImage;
};
