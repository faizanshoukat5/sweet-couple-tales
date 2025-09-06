-- Enable real-time functionality for messages table
-- This ensures complete row data is captured during updates and activates real-time functionality

-- Set replica identity to full to capture all column data in real-time updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages table to the supabase_realtime publication for real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create an index on sender_id and receiver_id for better real-time query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages (sender_id, receiver_id);

-- Create an index on timestamp for better ordering performance
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages (timestamp);

-- Create a composite index for unread message queries
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages (receiver_id, sender_id, is_read) WHERE is_read = false;