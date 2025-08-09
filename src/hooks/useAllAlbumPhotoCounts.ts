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
      const { data, error } = await supabase
        .from('album_photos')
        .select('album_id');
      if (!mounted) return;
      if (error || !data) {
        setCounts({});
        setLoading(false);
        return;
      }
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

    // Realtime updates to reflect new/deleted photos per album
    const channel = supabase
      .channel('album-photos-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'album_photos' }, async () => {
        // Refresh counts on any change
        const { data } = await supabase.from('album_photos').select('album_id');
        if (!mounted) return;
        const map: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          if (row.album_id) {
            map[row.album_id] = (map[row.album_id] || 0) + 1;
          }
        });
        setCounts(map);
      })
      .subscribe();

    return () => { mounted = false; try { supabase.removeChannel(channel); } catch {} };
  }, []);

  return { albumPhotoCounts: counts, loading };
}
