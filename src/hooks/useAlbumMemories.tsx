import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AlbumMemory {
  id: string;
  album_id: string;
  memory_id: string;
  created_at: string;
}

export const useAlbumMemories = (albumId: string) => {
  const [memoryIds, setMemoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAlbumMemories = async () => {
    if (!user || !albumId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('album_memories')
      .select('memory_id')
      .eq('album_id', albumId);
    if (!error) setMemoryIds(data?.map((row: AlbumMemory) => row.memory_id) || []);
    setLoading(false);
  };

  const addMemoryToAlbum = async (memoryId: string) => {
    if (!user || !albumId) return;
    const { error } = await supabase
      .from('album_memories')
      .insert([{ album_id: albumId, memory_id: memoryId }]);
    if (!error) setMemoryIds((prev) => [...prev, memoryId]);
  };

  const removeMemoryFromAlbum = async (memoryId: string) => {
    const { error } = await supabase
      .from('album_memories')
      .delete()
      .eq('album_id', albumId)
      .eq('memory_id', memoryId);
    if (!error) setMemoryIds((prev) => prev.filter(id => id !== memoryId));
  };

  useEffect(() => { fetchAlbumMemories(); }, [user, albumId, fetchAlbumMemories]);

  return { memoryIds, loading, addMemoryToAlbum, removeMemoryFromAlbum };
};
