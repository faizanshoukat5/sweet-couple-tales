-- Add status fields to messages table for better chat functionality
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Create an index for faster queries on unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON public.messages (receiver_id, is_read) 
WHERE is_read = false;

-- Create an index for faster queries on sender/receiver pairs
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages (sender_id, receiver_id, timestamp);

-- Add RLS policies for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read messages they sent or received
CREATE POLICY IF NOT EXISTS "Users can read their own messages" 
ON public.messages FOR SELECT 
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Policy: Allow users to insert messages they are sending
CREATE POLICY IF NOT EXISTS "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id
);

-- Policy: Allow users to update messages they received (for marking as read)
CREATE POLICY IF NOT EXISTS "Users can mark received messages as read" 
ON public.messages FOR UPDATE 
USING (
  auth.uid() = receiver_id
);

-- Enable real-time for messages table (if not already enabled)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the supabase_realtime publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
