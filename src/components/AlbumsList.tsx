
import { useAlbums } from '@/hooks/useAlbums';
import { useEffect, useMemo, useState } from 'react';
import { useAllAlbumPhotoCounts } from '@/hooks/useAllAlbumPhotoCounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSignedAlbumPhotoUrl } from '@/utils/getSignedAlbumPhotoUrl';

const AlbumsList = ({ cardStyle }: { cardStyle?: 'carousel' }) => {
  const { albums, loading, addAlbum, deleteAlbum, setAlbumCover } = useAlbums();
  const [form, setForm] = useState({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [errored, setErrored] = useState<Record<string, boolean>>({});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      await addAlbum(form.name, form.description);
      setForm({ name: '', description: '' });
      setShowAdd(false);
    }
  };


  // Use the new hook to get albumId -> photo count mapping
  const { albumPhotoCounts, loading: photoCountsLoading } = useAllAlbumPhotoCounts();

  // Preload cover thumbnails (first photo per album). Memoize list of album IDs to trigger effect when albums change.
  const albumIds = useMemo(() => albums.map(a => a.id).join(','), [albums]);
  useEffect(() => {
    let cancelled = false;
    async function loadThumbs() {
      if (!albums.length) return;
      const entries = await Promise.all(
        albums.map(async (album) => {
          try {
            // If album already has a cover_photo (stored path), sign it first for fastest display
            if (album.cover_photo) {
              const signedCover = await getSignedAlbumPhotoUrl(album.cover_photo);
              if (signedCover) return [album.id, signedCover] as const;
            }
            // Otherwise fallback to first album photo
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
          } catch {
            return [album.id, ''] as const;
          }
        })
      );
      if (!cancelled) {
        const map: Record<string, string> = {};
        entries.forEach(([id, url]) => { map[id] = url; });
        setThumbs(map);
      }
    }
    loadThumbs();
    return () => { cancelled = true; };
  }, [albumIds]);

  if (loading || photoCountsLoading) {
    return <div className="flex items-center justify-center h-32 w-full text-muted-foreground">Loading...</div>;
  }
  if (albums.length === 0) {
    return <div className="flex items-center justify-center h-32 w-full text-muted-foreground">No albums yet</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-xl border border-rose-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-rose-600 flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-rose-300" />
          Photo Albums
        </h2>
        <Button variant="romantic" className="rounded-full px-4 py-2 flex items-center gap-2" onClick={() => setShowAdd(v => !v)}>
          <Plus className="w-4 h-4" /> Add Album
        </Button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-6 items-center bg-rose-50 rounded-xl p-4 shadow-inner">
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Album name (e.g. Paris Trip)"
            className="flex-1"
            required
          />
          <Input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className="flex-1"
          />
          <Button type="submit" variant="romantic" className="rounded-full px-6">Create</Button>
        </form>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-32 w-full text-muted-foreground">Loading...</div>
      ) : albums.length === 0 ? (
        <div className="flex items-center justify-center h-32 w-full text-muted-foreground">No albums yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map(album => {
            const cover = thumbs[album.id]; // always rely on signed URL map
            const showImage = !!cover && !errored[album.id];
            return (
              <div key={album.id} className="group bg-white rounded-xl shadow-md border border-rose-100 hover:border-rose-400 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-between p-4 cursor-pointer relative">
                <div className="w-full h-28 rounded-lg flex items-center justify-center mb-3 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50 relative">
                  {showImage ? (
                    <img
                      src={cover}
                      alt={`Cover of ${album.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => setErrored(prev => ({ ...prev, [album.id]: true }))}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-rose-300">
                      <ImageIcon className="w-12 h-12" />
                      <span className="text-[10px] mt-1 opacity-70">No Photo</span>
                    </div>
                  )}
                  {showImage && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 flex items-end justify-end p-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setAlbumCover(album.id, album.cover_photo || cover || ''); }}
                        className="text-[10px] bg-white/80 hover:bg-white text-rose-700 font-semibold px-2 py-0.5 rounded"
                      >
                        {album.cover_photo ? 'Cover ✓' : 'Set Cover'}
                      </button>
                    </div>
                  )}
                </div>
              <div className="w-full">
                <div className="font-bold text-rose-700 truncate text-lg mb-1">{album.name}</div>
                {album.description && <div className="text-xs text-gray-500 truncate mb-1">{album.description}</div>}
                <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold mb-2">
                  <span className="bg-rose-100 rounded-full px-2 py-0.5">{albumPhotoCounts[album.id] || 0} photos</span>
                </div>
                <Button size="sm" variant="ghost" className="absolute top-2 right-2 text-rose-400 hover:text-rose-600" onClick={() => deleteAlbum(album.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlbumsList;
