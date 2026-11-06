/**
 * Image processing and local prototype storage utilities for WEARHUB.
 * Handles client-side optimization, canvas compression, and IndexedDB persistence
 * so local prototype listings survive page refreshes without requiring Firebase Storage.
 */

const DB_NAME = 'wearhub_prototype_db';
const STORE_NAME = 'listing_photos';
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB store for local prototype listing photos.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists an image Data URL into IndexedDB keyed by listing ID.
 */
export async function savePhotoToIndexedDB(id: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, dataUrl, savedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save photo to IndexedDB:', err);
  }
}

/**
 * Retrieves a persisted image Data URL from IndexedDB.
 */
export async function getPhotoFromIndexedDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve(req.result ? req.result.dataUrl : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read photo from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes a persisted image from IndexedDB.
 */
export async function deletePhotoFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete photo from IndexedDB:', err);
  }
}

/**
 * Compresses an image file (JPEG, PNG, WebP) using HTML5 Canvas.
 * Resizes large dimensions (e.g. 4000x3000 camera photos) down to a max of 1200px
 * and exports as optimized JPEG (quality 0.82), reducing a 5MB photo down to ~120-250KB.
 * This guarantees safe storage in localStorage / IndexedDB across page refreshes.
 */
export function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Proportional downscale if dimensions exceed maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw data URL if canvas 2D is unavailable
            resolve(reader.result as string);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw onto canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG for maximum browser compatibility and compact size
          const outputType = file.type === 'image/png' && hasAlphaChannel(ctx, width, height)
            ? 'image/png'
            : 'image/jpeg';

          const dataUrl = canvas.toDataURL(outputType, quality);
          resolve(dataUrl);
        } catch {
          // If canvas export fails, safely fall back to original reader result
          resolve(reader.result as string);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Fast sampling to detect if a PNG has transparent pixels.
 */
function hasAlphaChannel(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const sampleStep = Math.max(1, Math.floor(width / 20));
    const imgData = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < imgData.length; i += 4 * sampleStep) {
      if (imgData[i] < 255) {
        return true;
      }
    }
  } catch {
    // Ignore error
  }
  return false;
}

/**
 * Returns a permanent hosted fallback image for a given category.
 * Used when saving to Firestore so external users never receive a broken blob or missing image.
 */
export function getCategoryFallbackImage(category: string): string {
  switch (category) {
    case 'Jewellery & Bracelets':
      return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80';
    case 'Bags & Accessories':
      return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80';
    case 'Shoes & Footwear':
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80';
    case 'Books & Stationery':
      return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80';
    case 'Event & Performance Items':
      return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80';
    case 'Clothing & Outfits':
      return 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80';
    default:
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';
  }
}
