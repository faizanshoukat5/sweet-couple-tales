import { useEffect, useState, useMemo } from 'react';
import { getSignedMemoryPhotoUrl } from '@/utils/getSignedMemoryPhotoUrl';

// Global cache for signed URLs to avoid redundant API calls
const signedUrlCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (URLs expire in 1 hour)

export function useSignedMemoryPhotoUrls(memoryPhotos: { url: string; memoryId: string; memoryTitle: string }[]) {
  const [signedUrls, setSignedUrls] = useState<{ [url: string]: string }>({});

  // Memoize unique photo URLs to prevent unnecessary re-fetching
  const uniquePhotoUrls = useMemo(() => {
    const urlSet = new Set<string>();
    return memoryPhotos.filter(mp => {
      if (!mp.url || urlSet.has(mp.url)) return false;
      urlSet.add(mp.url);
      return true;
    });
  }, [memoryPhotos]);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchUrls() {
      if (uniquePhotoUrls.length === 0) {
        setSignedUrls({});
        return;
      }

      const urlMap: { [url: string]: string } = {};
      const now = Date.now();
      
      // First, check cache for existing valid URLs
      uniquePhotoUrls.forEach(mp => {
        let storagePath = mp.url;
        if (mp.url.includes('/storage/v1/object/public/memory-photos/')) {
          storagePath = mp.url.split('/storage/v1/object/public/memory-photos/')[1];
        }
        
        const cached = signedUrlCache.get(storagePath);
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          urlMap[mp.url] = cached.url;
        }
      });

      // Fetch only URLs that aren't cached or are expired
      const urlsToFetch = uniquePhotoUrls.filter(mp => {
        let storagePath = mp.url;
        if (mp.url.includes('/storage/v1/object/public/memory-photos/')) {
          storagePath = mp.url.split('/storage/v1/object/public/memory-photos/')[1];
        }
        
        const cached = signedUrlCache.get(storagePath);
        return !cached || (now - cached.timestamp) >= CACHE_DURATION;
      });

      if (urlsToFetch.length > 0) {
        try {
          await Promise.all(
            urlsToFetch.map(async (mp) => {
              let storagePath = mp.url;
              if (mp.url.includes('/storage/v1/object/public/memory-photos/')) {
                storagePath = mp.url.split('/storage/v1/object/public/memory-photos/')[1];
              }
              
              try {
                const signed = await getSignedMemoryPhotoUrl(storagePath);
                if (signed) {
                  urlMap[mp.url] = signed;
                  // Cache the result
                  signedUrlCache.set(storagePath, { url: signed, timestamp: now });
                }
              } catch (error) {
                console.warn('Failed to get signed URL for:', storagePath, error);
              }
            })
          );
        } catch (error) {
          console.warn('Error fetching signed URLs:', error);
        }
      }

      if (isMounted) {
        setSignedUrls(urlMap);
      }
    }

    fetchUrls();
    
    return () => { 
      isMounted = false; 
    };
  }, [uniquePhotoUrls]);

  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      for (const [key, value] of signedUrlCache.entries()) {
        if (now - value.timestamp >= CACHE_DURATION) {
          signedUrlCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, 10 * 60 * 1000); // Clean every 10 minutes
    return () => clearInterval(interval);
  }, []);

  return signedUrls;
}
