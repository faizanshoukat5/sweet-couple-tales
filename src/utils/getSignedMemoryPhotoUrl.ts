import { supabase } from '@/integrations/supabase/client';
import type { TransformOptions } from '@supabase/storage-js';

// Simple in-memory cache (persists for session). Keyed by storage path.
// Each entry stores signedUrl and expiry epoch (ms)
const memoryPhotoUrlCache: Map<string, { url: string; exp: number }> = new Map();
const TTL_SECONDS = 55 * 60; // 55 min (slightly less than 60m signed duration)

export async function getSignedMemoryPhotoUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const cached = memoryPhotoUrlCache.get(path);
  const now = Date.now();
  if (cached && cached.exp > now) return cached.url;
  const { data, error } = await supabase.storage.from('memory-photos').createSignedUrl(path, 60 * 60); // 1 hour
  if (error) {
    console.error('Error getting signed URL for memory photo:', error);
    return cached ? cached.url : null; // fallback to stale if available
  }
  if (data?.signedUrl) memoryPhotoUrlCache.set(path, { url: data.signedUrl, exp: now + TTL_SECONDS * 1000 });
  return data?.signedUrl || null;
}

// Cached transformed URLs keyed by path + serialized transform options
const transformedCache: Map<string, { url: string; exp: number }> = new Map();

export type ImageTransform = TransformOptions;

function transformKey(path: string, t: ImageTransform) {
  const parts = [path, t.width ?? '', t.height ?? '', t.resize ?? '', t.quality ?? '', t.format ?? ''];
  return parts.join('|');
}

export async function getSignedMemoryPhotoUrlTransformed(path: string, transform: ImageTransform): Promise<string | null> {
  if (!path) return null;
  const key = transformKey(path, transform);
  const cached = transformedCache.get(key);
  const now = Date.now();
  if (cached && cached.exp > now) return cached.url;
  try {
    const { data, error } = await supabase.storage
      .from('memory-photos')
      .createSignedUrl(path, 60 * 60, { transform });
    if (error) {
      console.error('Error getting transformed signed URL for memory photo:', error);
      return cached ? cached.url : null;
    }
    if (data?.signedUrl) transformedCache.set(key, { url: data.signedUrl, exp: now + TTL_SECONDS * 1000 });
    return data?.signedUrl || null;
  } catch (e) {
    console.error('getSignedMemoryPhotoUrlTransformed failed', e);
    return cached ? cached.url : null;
  }
}
