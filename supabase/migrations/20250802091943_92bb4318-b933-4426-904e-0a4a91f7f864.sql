-- Create chat_attachments storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for chat_attachments bucket
CREATE POLICY "Users can view their own chat attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat_attachments' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR auth.uid()::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can upload their own chat attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat_attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own chat attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat_attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own chat attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat_attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);