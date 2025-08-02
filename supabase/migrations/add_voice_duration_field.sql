-- Add voice_duration field to messages table for voice message functionality
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS voice_duration integer;
