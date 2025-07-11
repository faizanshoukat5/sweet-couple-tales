import { supabase } from '@/integrations/supabase/client';

export async function uploadAlbumPhotoFile(userId: string, albumId: string, file: File): Promise<string | null> {
  if (!userId) return null;
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/albums/${albumId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { data, error } = await supabase.storage.from('album-photos').upload(filePath, file);
  if (error) return null;
  return filePath;
}
