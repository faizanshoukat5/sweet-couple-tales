import { supabase } from '@/integrations/supabase/client';

export async function getSignedAlbumPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('album-photos').createSignedUrl(path, 60 * 60); // 1 hour
  if (error) return null;
  return data?.signedUrl || null;
}
