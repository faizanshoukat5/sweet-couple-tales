import { supabase } from '@/integrations/supabase/client';

/**
 * Get file extension based on MIME type
 */
function getExtensionFromMime(mimeType: string): string {
  if (mimeType.includes('mp4') || mimeType.includes('m4a') || mimeType.includes('aac')) {
    return 'm4a';
  }
  if (mimeType.includes('ogg')) {
    return 'ogg';
  }
  if (mimeType.includes('wav')) {
    return 'wav';
  }
  // Default to webm for webm and opus
  return 'webm';
}

export const uploadVoiceMessage = async (
  userId: string,
  partnerId: string,
  audioBlob: Blob
): Promise<string | null> => {
  try {
    // Preserve the actual MIME type from the blob (set by MediaRecorder)
    const mimeType = audioBlob.type || 'audio/webm';
    const extension = getExtensionFromMime(mimeType);
    
    console.log('[uploadVoiceMessage] Blob MIME type:', mimeType, 'Extension:', extension);
    
    // Create a File object from the Blob with correct extension and MIME type
    const fileName = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const file = new File([audioBlob], fileName, { type: mimeType });
    
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

    console.log('[uploadVoiceMessage] Upload successful, returning path:', filePath);
    return filePath;
  } catch (error) {
    console.error('Voice upload error:', error);
    return null;
  }
};
