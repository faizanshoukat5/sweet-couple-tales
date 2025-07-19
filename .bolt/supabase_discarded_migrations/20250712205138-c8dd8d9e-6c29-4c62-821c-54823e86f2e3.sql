-- Enable real-time for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the supabase_realtime publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;