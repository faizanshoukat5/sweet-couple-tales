import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Returns a mapping: albumId -> photo count
export function useAllAlbumPhotoCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchCounts() {
      setLoading(true);
      // Fetch all album photos (assuming table: album_photos, with album_id)
      const { data, error } = await supabase
        .from('album_photos')
        .select('album_id');
      if (!mounted) return;
      if (error || !data) {
        setCounts({});
        setLoading(false);
        return;
      }
      // Count photos per album
      const map: Record<string, number> = {};
      data.forEach((row: any) => {
        if (row.album_id) {
          map[row.album_id] = (map[row.album_id] || 0) + 1;
        }
      });
      setCounts(map);
      setLoading(false);
    }
    fetchCounts();
    return () => { mounted = false; };
  }, []);

  return { albumPhotoCounts: counts, loading };
}
