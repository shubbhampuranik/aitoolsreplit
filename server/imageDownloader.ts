import { ObjectStorageService } from './objectStorage.js';
import { randomUUID } from 'crypto';

interface DownloadResult {
  success: boolean;
  objectPath?: string;
  error?: string;
}

export class ImageDownloader {
  private objectStorage: ObjectStorageService;

  constructor() {
    this.objectStorage = new ObjectStorageService();
  }

  async downloadAndStoreImage(imageUrl: string, type: 'logo' | 'screenshot'): Promise<DownloadResult> {
    try {
      // Download image
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return { success: false, error: `Failed to download image: ${response.status}` };
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        return { success: false, error: 'URL does not point to an image' };
      }

      // Check file size (max 5MB)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
        return { success: false, error: 'Image too large (max 5MB)' };
      }

      // Get file extension
      const extension = this.getFileExtension(contentType, imageUrl);
      
      // Generate unique filename
      const fileName = `${type}_${randomUUID()}.${extension}`;
      
      // Get upload URL
      const uploadUrl = await this.objectStorage.getObjectEntityUploadURL();
      
      // Upload to object storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: response.body,
        headers: {
          'Content-Type': contentType
        }
      });

      if (!uploadResponse.ok) {
        return { success: false, error: 'Failed to upload to storage' };
      }

      // Get the object path from upload URL
      const objectPath = `/objects/uploads/${fileName}`;
      
      return { success: true, objectPath };

    } catch (error) {
      console.error('Image download error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private getFileExtension(contentType: string, url: string): string {
    // Try to get extension from content type
    const typeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    };

    if (typeMap[contentType]) {
      return typeMap[contentType];
    }

    // Fallback to URL extension
    const urlExtension = url.split('.').pop()?.toLowerCase();
    if (urlExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(urlExtension)) {
      return urlExtension === 'jpeg' ? 'jpg' : urlExtension;
    }

    return 'jpg'; // Default fallback
  }

  async downloadMultipleImages(imageUrls: string[], type: 'logo' | 'screenshot'): Promise<Array<{ url: string; result: DownloadResult }>> {
    const results = await Promise.allSettled(
      imageUrls.map(async (url) => ({
        url,
        result: await this.downloadAndStoreImage(url, type)
      }))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: imageUrls[index],
          result: { success: false, error: 'Download failed' }
        };
      }
    });
  }
}

export const imageDownloader = new ImageDownloader();