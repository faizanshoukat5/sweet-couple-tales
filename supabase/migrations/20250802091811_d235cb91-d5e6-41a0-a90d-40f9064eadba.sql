-- Add new attachment columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS attachment_filename TEXT,
ADD COLUMN IF NOT EXISTS attachment_size BIGINT;

-- Update existing messages with attachment_url to have proper filename
UPDATE public.messages 
SET attachment_filename = attachment_name 
WHERE attachment_url IS NOT NULL AND attachment_filename IS NULL;