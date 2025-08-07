import { supabase } from '@/integrations/supabase/client';

export async function getSignedChatAttachmentUrl(path: string, expiresInSeconds: number = 60 * 60): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('chat_attachments')
    .createSignedUrl(path, expiresInSeconds);
  if (error) {
    console.error('Error getting signed URL for chat attachment:', error);
    return null;
  }
  return data?.signedUrl || null;
}
