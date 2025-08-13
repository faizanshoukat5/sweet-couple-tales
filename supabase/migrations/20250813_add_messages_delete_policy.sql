-- Allow users to delete messages they sent OR received (to support clear chat for both participants)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can delete own or received messages'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can delete own or received messages"
      ON public.messages FOR DELETE
      USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
      );
    $$;
  END IF;
END $$;
