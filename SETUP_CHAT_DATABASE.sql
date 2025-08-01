-- =================================================================
-- SWEET COUPLES TALES - CHAT SYSTEM DATABASE SETUP
-- =================================================================
-- Run these queries in order in your Supabase SQL Editor

-- =================================================================
-- 1. UPDATE MESSAGES TABLE STRUCTURE
-- =================================================================
-- Add status fields to messages table for better chat functionality
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Update existing messages to have delivered_at timestamp
UPDATE public.messages 
SET delivered_at = timestamp 
WHERE delivered_at IS NULL;

-- =================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =================================================================
-- Index for faster queries on unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON public.messages (receiver_id, is_read) 
WHERE is_read = false;

-- Index for faster queries on sender/receiver pairs
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages (sender_id, receiver_id, timestamp);

-- Index for faster queries on message status
CREATE INDEX IF NOT EXISTS idx_messages_status 
ON public.messages (sender_id, delivered_at, read_at);

-- =================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =================================================================
-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON public.messages;

-- Policy: Allow users to read messages they sent or received
CREATE POLICY "Users can read their own messages" 
ON public.messages FOR SELECT 
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Policy: Allow users to insert messages they are sending
CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id
);

-- Policy: Allow users to update messages they received (for marking as read)
CREATE POLICY "Users can mark received messages as read" 
ON public.messages FOR UPDATE 
USING (
  auth.uid() = receiver_id
);

-- =================================================================
-- 4. ENABLE REAL-TIME FUNCTIONALITY
-- =================================================================
-- Set replica identity for real-time updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the supabase_realtime publication
-- (This might already exist, but it's safe to run again)
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- =================================================================
-- 5. CREATE HELPER FUNCTIONS (OPTIONAL)
-- =================================================================
-- Function to automatically mark messages as delivered when inserted
CREATE OR REPLACE FUNCTION mark_message_delivered()
RETURNS TRIGGER AS $$
BEGIN
  -- Set delivered_at to current timestamp if not already set
  IF NEW.delivered_at IS NULL THEN
    NEW.delivered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting delivered_at
DROP TRIGGER IF EXISTS messages_delivered_trigger ON public.messages;
CREATE TRIGGER messages_delivered_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_message_delivered();

-- =================================================================
-- 6. VERIFICATION QUERIES
-- =================================================================
-- Run these to verify everything is working correctly:

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'messages' 
AND schemaname = 'public';

-- Check RLS policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'messages' 
AND schemaname = 'public';

-- Check real-time publication
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'messages';

-- =================================================================
-- 7. TEST DATA (OPTIONAL - FOR TESTING ONLY)
-- =================================================================
-- Uncomment and modify these if you want to test with sample data
-- Replace the UUIDs with actual user IDs from your auth.users table

/*
-- Sample test message (replace UUIDs with real user IDs)
INSERT INTO public.messages (sender_id, receiver_id, content) 
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual user ID
  '00000000-0000-0000-0000-000000000002', -- Replace with actual user ID
  'Hello! This is a test message.'
);

-- Mark a message as read (replace message ID)
UPDATE public.messages 
SET is_read = true, read_at = now() 
WHERE id = 'your-message-id-here';
*/

-- =================================================================
-- COMPLETION MESSAGE
-- =================================================================
-- If all queries ran successfully, your chat system is now ready!
-- The following features are now enabled:
-- ✅ Real-time message delivery
-- ✅ Message read/delivered status
-- ✅ Proper security with RLS
-- ✅ Optimized database queries
-- ✅ Automatic delivered_at timestamps

SELECT 'Chat system setup completed successfully!' as status;
