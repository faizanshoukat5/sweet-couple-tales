import { useEffect, useState } from 'react';
import { getSignedMemoryPhotoUrl } from '@/utils/getSignedMemoryPhotoUrl';

export function useSignedMemoryPhotoUrls(memoryPhotos: { url: string; memoryId: string; memoryTitle: string }[]) {
  const [signedUrls, setSignedUrls] = useState<{ [url: string]: string }>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchUrls() {
      console.log('Fetching signed URLs for memory photos:', memoryPhotos);
      const urlMap: { [url: string]: string } = {};
      await Promise.all(
        memoryPhotos.map(async (mp) => {
          if (!mp.url) return;
          // Extract the storage path from the URL if it's already a full URL
          let storagePath = mp.url;
          if (mp.url.includes('/storage/v1/object/public/memory-photos/')) {
            // Extract just the file path from the public URL
            storagePath = mp.url.split('/storage/v1/object/public/memory-photos/')[1];
          }
          console.log('Getting signed URL for storage path:', storagePath, 'from original URL:', mp.url);
          const signed = await getSignedMemoryPhotoUrl(storagePath);
          console.log('Got signed URL:', signed, 'for path:', storagePath);
          if (signed) urlMap[mp.url] = signed;
        })
      );
      console.log('Final URL map:', urlMap);
      if (isMounted) setSignedUrls(urlMap);
    }
    if (memoryPhotos.length > 0) fetchUrls();
    else setSignedUrls({});
    return () => { isMounted = false; };
  }, [memoryPhotos]);

  return signedUrls;
}
