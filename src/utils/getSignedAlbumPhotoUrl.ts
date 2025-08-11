import { supabase } from '@/integrations/supabase/client';

const albumPhotoCache: Map<string, { url: string; exp: number }> = new Map();
const TTL_SECONDS = 55 * 60; // 55 minutes

export async function getSignedAlbumPhotoUrl(pathOrUrl: string): Promise<string | null> {
  try {
    let bucket = 'album-photos';
    let objectPath = pathOrUrl;

    // Handle full URLs from Supabase storage
    if (pathOrUrl.includes('/storage/v1/object/')) {
      const after = pathOrUrl.split('/storage/v1/object/')[1]; // e.g., "public/album-photos/uid/.../file.jpg"
      const segments = after.split('/');
      // segments[0] = 'public' | 'sign' | 'auth'
      if (segments.length >= 3) {
        bucket = segments[1];
        objectPath = segments.slice(2).join('/');
      }
    } else if (pathOrUrl.startsWith('album-photos/')) {
      bucket = 'album-photos';
      objectPath = pathOrUrl.slice('album-photos/'.length);
    } else if (pathOrUrl.startsWith('memory-photos/')) {
      bucket = 'memory-photos';
      objectPath = pathOrUrl.slice('memory-photos/'.length);
    } else {
      // Default: treat as object path in album-photos
      bucket = 'album-photos';
      objectPath = pathOrUrl;
    }

    // Remove any query string just in case
    objectPath = objectPath.split('?')[0];

    const cacheKey = bucket + ':' + objectPath;
    const cached = albumPhotoCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.exp > now) return cached.url;

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, 60 * 60); // 1 hour
    if (error) {
      console.error('Error creating signed URL', { bucket, objectPath, error });
      return cached ? cached.url : null;
    }
    if (data?.signedUrl) albumPhotoCache.set(cacheKey, { url: data.signedUrl, exp: now + TTL_SECONDS * 1000 });
    return data?.signedUrl || null;
  } catch (err) {
    console.error('getSignedAlbumPhotoUrl failed', err);
    return null;
  }
}
