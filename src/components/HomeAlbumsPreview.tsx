import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAlbums } from '@/hooks/useAlbums';
import { useAllAlbumPhotoCounts } from '@/hooks/useAllAlbumPhotoCounts';
import { getSignedAlbumPhotoUrl } from '@/utils/getSignedAlbumPhotoUrl';
import { supabase } from '@/integrations/supabase/client';

export default function HomeAlbumsPreview() {
  const navigate = useNavigate();
  const { albums, loading } = useAlbums();
  const { albumPhotoCounts } = useAllAlbumPhotoCounts();
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  const previewAlbums = useMemo(() => albums.slice(0, 6), [albums]);

  useEffect(() => {
    let cancelled = false;
    async function loadThumbs() {
      const entries = await Promise.all(
        previewAlbums.map(async (album) => {
          const { data } = await supabase
            .from('album_photos')
            .select('id,url')
            .eq('album_id', album.id)
            .order('created_at', { ascending: true })
            .limit(1);
          const url = data && data[0]?.url;
          if (!url) return [album.id, ''] as const;
          const signed = await getSignedAlbumPhotoUrl(url);
          return [album.id, signed || ''] as const;
        })
      );
      if (!cancelled) {
        const map: Record<string, string> = {};
        entries.forEach(([id, url]) => { map[id] = url; });
        setThumbs(map);
      }
    }
    if (previewAlbums.length) loadThumbs();
    return () => { cancelled = true; };
  }, [previewAlbums]);

  if (loading) return null;
  if (previewAlbums.length === 0) return null;

  return (
    <section aria-labelledby="albums-preview-heading" className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 id="albums-preview-heading" className="text-2xl font-bold text-foreground">Your Albums</h2>
          <Button variant="outline" onClick={() => navigate('/dashboard#albums')}>
            View all
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewAlbums.map((album) => (
            <Card key={album.id} className="overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard#albums')}>
              <div className="aspect-[4/3] w-full bg-muted overflow-hidden">
                {thumbs[album.id] ? (
                  <img
                    src={thumbs[album.id]}
                    alt={`Album cover for ${album.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={'/placeholder.svg'}
                    alt={`Album cover placeholder for ${album.name}`}
                    className="w-full h-full object-cover opacity-70"
                    loading="lazy"
                  />
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{album.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground flex items-center justify-between">
                <span>{album.description || '—'}</span>
                <span className="ml-3 shrink-0">{albumPhotoCounts[album.id] || 0} photos</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
