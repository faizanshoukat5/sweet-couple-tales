import { supabase } from '@/integrations/supabase/client';

export async function getSignedMemoryPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('memory-photos').createSignedUrl(path, 60 * 60); // 1 hour
  if (error) {
    console.error('Error getting signed URL for memory photo:', error);
    return null;
  }
  return data?.signedUrl || null;
}
