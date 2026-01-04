import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { ServiceError } from '../utils/errors';

// Client-side storage fallback (uses localStorage and base64)
class LocalStorageFallback {
  private storagePrefix = 'temp_storage_';
  
  async storeFile(fileName: string, file: File): Promise<{ path: string, url: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try {
          if (typeof reader.result !== 'string') {
            reject(new Error('Failed to convert file to base64'));
            return;
          }
          
          const fileId = uuidv4();
          const path = `local/${fileName}`;
          const storedItem = {
            id: fileId,
            name: fileName,
            type: file.type,
            size: file.size,
            data: reader.result,
            timestamp: Date.now()
          };
          
          // Store in localStorage (with 5MB limit check)
          if (reader.result.length > 5 * 1024 * 1024) {
            reject(new Error('File too large for local storage (5MB limit)'));
            return;
          }
          
          localStorage.setItem(this.storagePrefix + fileId, JSON.stringify(storedItem));
          
          // Create a local object URL for immediate viewing
          const blob = this.dataURItoBlob(reader.result);
          const url = URL.createObjectURL(blob);
          
          resolve({ path, url });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
    });
  }
  
  async deleteFile(path: string): Promise<void> {
    // Extract the file ID from the path
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    // Find the item in localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.name === fileName) {
            localStorage.removeItem(key);
            console.log(`Local file ${fileName} deleted`);
            return;
          }
        } catch (e) {
          console.error('Error parsing localStorage item:', e);
        }
      }
    }
    
    throw new Error(`File ${path} not found in local storage`);
  }
  
  private dataURItoBlob(dataURI: string): Blob {
    // Convert base64/URLEncoded data to raw binary data
    const byteString = dataURI.split(',')[0].indexOf('base64') >= 0 
      ? atob(dataURI.split(',')[1])
      : decodeURIComponent(dataURI.split(',')[1]);
    
    // Separate the MIME part
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    // Write the bytes to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  }
}

// Create an instance of the local storage handler
const localStorageFallback = new LocalStorageFallback();

/**
 * Compresses an image file to reduce size
 * @param file The original image file
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @param quality Compression quality (0-1)
 * @returns A promise resolving to the compressed file
 */
async function compressImage(
  file: File, 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.7
): Promise<File> {
  // If not an image or is already small, return the original file
  if (!file.type.startsWith('image/') || file.size < 100 * 1024) { // Reduced threshold to 100KB
    return file;
  }

  // Use more aggressive compression for larger files
  const fileQuality = file.size > 1024 * 1024 ? 0.6 : quality;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality setting
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File(
              [blob], 
              file.name, 
              { type: file.type }
            );
            
            console.log(`Compressed image from ${(file.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`);
            
            // Ensure the compressed file is actually smaller
            if (compressedFile.size >= file.size) {
              console.log('Compression did not reduce file size, using original file');
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          file.type,
          fileQuality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Uploads an ID card image using Supabase Storage or falls back to local storage
 * @param file The file to upload
 * @param firstName First name of the individual 
 * @param idNumber ID number of the individual
 * @param individualId Optional individual ID to use in the file path
 * @returns Object containing the file path and public URL
 */
export async function uploadIdCardImage(
  file: File, 
  firstName?: string,
  idNumber?: string,
  individualId?: string
): Promise<{ path: string, url: string }> {
  try {
    // Check if the Supabase client is initialized
    if (!supabase || !supabase.storage) {
      console.warn('Supabase storage not available, using local storage fallback');
      return await useLocalStorageFallback();
    }
    
    // First, try to compress the image if it's an image file
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file);
        console.log(`Compression successful: Original ${file.size} bytes, Compressed ${fileToUpload.size} bytes`);
      } catch (compressionError) {
        console.warn('Image compression failed, using original file:', compressionError);
        // Continue with the original file if compression fails
      }
    }
    
    // Create a unique file name with the new naming convention
    const fileExt = file.name.split('.').pop();
    let fileName;
    
    if (firstName && idNumber && idNumber.length >= 5) {
      // Use the requested naming convention: firstName + personalinfo + first 5 digits of ID
      const idPrefix = idNumber.replace(/\D/g, '').substring(0, 5); // Get first 5 numbers, removing non-digits
      fileName = `${firstName}_personalinfo_${idPrefix}.${fileExt}`;
    } else {
      // Fallback to the previous naming pattern if required info is missing
      fileName = `${individualId || uuidv4()}_${Date.now()}.${fileExt}`;
    }
    
    // Try to find an accessible bucket for upload
    let canUpload = false;
    let accessibleBucket = '';
    
    // Try each bucket to see if we can upload to it
    console.log('Checking if any buckets are writable...');
    
    // List of bucket names to try
    const possibleBuckets = [
      'idcard'
    ];
    
    for (const bucketName of possibleBuckets) {
      try {
        // Try a small test upload
        const testContent = new Uint8Array([0, 1, 2, 3]);
        const testFile = new File([testContent], 'test_permission.bin', { type: 'application/octet-stream' });
        const testFilePath = `test_${Date.now()}.bin`;
        
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(testFilePath, testFile, { upsert: true });
          
        if (!error) {
          // We found a bucket we can upload to!
          accessibleBucket = bucketName;
          canUpload = true;
          console.log(`Found writable bucket: ${accessibleBucket}`);
          
          // Try to clean up the test file
          try {
            await supabase.storage.from(bucketName).remove([testFilePath]);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          break;
        }
      } catch (e) {
        // Ignore errors and try the next bucket
      }
    }
    
    // If we can't upload to any bucket, fall back to local storage
    if (!canUpload) {
      console.warn('No writable buckets found - using local storage fallback');
      return await useLocalStorageFallback();
    }
    
    // Upload to the accessible bucket
    console.log(`Uploading file to bucket: ${accessibleBucket}`);
    const { data, error } = await supabase.storage
      .from(accessibleBucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileToUpload.type
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      console.warn('Falling back to local storage...');
      return await useLocalStorageFallback();
    }
    
    if (!data || !data.path) {
      throw new ServiceError('upload-failed', 'Failed to get file path from upload response', null);
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(accessibleBucket)
      .getPublicUrl(fileName);
    
    if (!urlData?.publicUrl) {
      throw new ServiceError('url-generation-failed', 'Failed to generate public URL', null);
    }
    
    return {
      path: `${accessibleBucket}/${fileName}`,
      url: urlData.publicUrl
    };
    
  } catch (error) {
    console.error('Error in uploadIdCardImage:', error);
    
    // If any error occurs during the Supabase upload process, fall back to local storage
    return await useLocalStorageFallback();
  }
  
  // Local storage fallback implementation
  async function useLocalStorageFallback(): Promise<{ path: string, url: string }> {
    console.log('Using localStorage fallback for file storage');
    
    // Still compress the image if possible
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file);
      } catch (e) {
        // Continue with original file if compression fails
      }
    }
    
    // Create a file name with the naming convention
    const fileExt = file.name.split('.').pop();
    let fileName;
    
    if (firstName && idNumber && idNumber.length >= 5) {
      const idPrefix = idNumber.replace(/\D/g, '').substring(0, 5);
      fileName = `${firstName}_personalinfo_${idPrefix}.${fileExt}`;
    } else {
      fileName = `${individualId || uuidv4()}_${Date.now()}.${fileExt}`;
    }
    
    // Store the file in localStorage
    return await localStorageFallback.storeFile(fileName, fileToUpload);
  }
}

/**
 * Deletes a file from storage, with fallback to local storage
 * @param path The file path to delete (including bucket name)
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    // Check if this is a local storage path
    if (path.startsWith('local/')) {
      await localStorageFallback.deleteFile(path);
      console.log(`File deleted from local storage: ${path}`);
      return;
    }
    
    console.log(`Attempting to delete file: ${path}`);
    const [bucket, ...pathParts] = path.split('/');
    const filePath = pathParts.join('/');
    
    // Check if the Supabase client is initialized
    if (!supabase || !supabase.storage) {
      throw new ServiceError('supabase-client-error', 'Supabase client or storage is not initialized', null);
    }
    
    // Use the Supabase client for file deletion
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Supabase storage delete error:', error);
      throw new ServiceError('delete-failed', `Failed to delete file: ${error.message}`, error);
    }
    
    console.log(`File deleted successfully: ${path}`);
  } catch (error) {
    console.error('Error in deleteFile:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('delete-failed', 'Failed to delete file', error);
  }
}

/**
 * Helper function to convert File to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * This would be a separate API endpoint to handle file content storage
 * In a real implementation, this would be a direct upload to storage
 */
async function saveFileContent(bucket: string, fileName: string, base64Content: string): Promise<void> {
  // In a real implementation, this would be a direct upload to storage
  // For demonstration purposes only - not used in current implementation
  console.log(`Would save ${base64Content.substring(0, 20)}... to ${bucket}/${fileName}`);
}

// Removed MCP function declarations since they're not available in this environment 