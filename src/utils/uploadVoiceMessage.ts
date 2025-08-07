import { supabase } from '@/integrations/supabase/client';

export const uploadVoiceMessage = async (
  userId: string,
  partnerId: string,
  audioBlob: Blob
): Promise<string | null> => {
  try {
    // Create a File object from the Blob with appropriate extension
    const fileName = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}.webm`;
    const file = new File([audioBlob], fileName, { type: 'audio/webm' });
    
    const filePath = `${userId}/${partnerId}/voice/${fileName}`;

    // Upload voice message to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Voice upload error:', error);
      return null;
    }

    return filePath;
  } catch (error) {
    console.error('Voice upload error:', error);
    return null;
  }
};
