import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getSignedAlbumPhotoUrl } from '@/utils/getSignedAlbumPhotoUrl';

export interface AlbumPhoto {
  id: string;
  album_id: string;
  url: string;
  created_at: string;
}

export const useAlbumPhotos = (albumId: string) => {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<{ [id: string]: string }>({});
  const { user } = useAuth();

  const fetchPhotos = async () => {
    if (!user || !albumId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', albumId)
      .order('created_at', { ascending: true });
    if (!error) setPhotos(data || []);
    setLoading(false);
  };

  const addPhoto = async (url: string) => {
    if (!user || !albumId) return;
    const { data, error } = await supabase
      .from('album_photos')
      .insert([{ album_id: albumId, url }])
      .select();
    if (!error && data) {
      setPhotos((prev) => [...prev, ...data]);
      // Force re-fetch to update signed URLs
      fetchPhotos();
    }
  };

  const deletePhoto = async (id: string) => {
    const { error } = await supabase
      .from('album_photos')
      .delete()
      .eq('id', id);
    if (!error) setPhotos((prev) => prev.filter(p => p.id !== id));
  };

  useEffect(() => { fetchPhotos(); }, [user, albumId]);

  useEffect(() => {
    async function fetchSignedUrls() {
      if (!photos.length) return;
      const urls: { [id: string]: string } = {};
      await Promise.all(
        photos.map(async (photo) => {
          // photo.url is the storage path
          const signed = await getSignedAlbumPhotoUrl(photo.url);
          if (signed) urls[photo.id] = signed;
        })
      );
      setSignedUrls(urls);
    }
    fetchSignedUrls();
  }, [photos]);

  return { photos, loading, addPhoto, deletePhoto, signedUrls };
};
