-- Security hardening migration
-- 1) Enable RLS on custom quiz tables
ALTER TABLE IF EXISTS public.custom_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates (safe if none exist)
DROP POLICY IF EXISTS "Quiz: creator or partner can view" ON public.custom_quizzes;
DROP POLICY IF EXISTS "Quiz: creator can insert" ON public.custom_quizzes;
DROP POLICY IF EXISTS "Quiz: creator can update" ON public.custom_quizzes;
DROP POLICY IF EXISTS "Quiz: creator can delete" ON public.custom_quizzes;

DROP POLICY IF EXISTS "Quiz attempts: taker or creator can view" ON public.custom_quiz_attempts;
DROP POLICY IF EXISTS "Quiz attempts: taker can insert" ON public.custom_quiz_attempts;
DROP POLICY IF EXISTS "Quiz attempts: taker can update" ON public.custom_quiz_attempts;
DROP POLICY IF EXISTS "Quiz attempts: taker can delete" ON public.custom_quiz_attempts;

-- Recreate strict policies
CREATE POLICY "Quiz: creator or partner can view"
ON public.custom_quizzes
FOR SELECT
USING (auth.uid() = creator_id OR auth.uid() = partner_id);

CREATE POLICY "Quiz: creator can insert"
ON public.custom_quizzes
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Quiz: creator can update"
ON public.custom_quizzes
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Quiz: creator can delete"
ON public.custom_quizzes
FOR DELETE
USING (auth.uid() = creator_id);

CREATE POLICY "Quiz attempts: taker or creator can view"
ON public.custom_quiz_attempts
FOR SELECT
USING (auth.uid() = taker_id OR auth.uid() = creator_id);

CREATE POLICY "Quiz attempts: taker can insert"
ON public.custom_quiz_attempts
FOR INSERT
WITH CHECK (auth.uid() = taker_id);

CREATE POLICY "Quiz attempts: taker can update"
ON public.custom_quiz_attempts
FOR UPDATE
USING (auth.uid() = taker_id);

CREATE POLICY "Quiz attempts: taker can delete"
ON public.custom_quiz_attempts
FOR DELETE
USING (auth.uid() = taker_id);

-- 2) Lock down profiles visibility
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: owner can view" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: owner or partner can view" ON public.profiles;

CREATE POLICY "Profiles: owner or accepted partner can view"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.couples c
    WHERE c.status = 'accepted'
      AND (
        (c.user1_id = auth.uid() AND c.user2_id = profiles.user_id)
        OR
        (c.user2_id = auth.uid() AND c.user1_id = profiles.user_id)
      )
  )
);

-- 3) Storage: Make chat_attachments private and add strict policies
UPDATE storage.buckets SET public = FALSE WHERE id = 'chat_attachments';

-- Drop any previous chat_attachments policies
DROP POLICY IF EXISTS "chat attachments: read for sender or receiver" ON storage.objects;
DROP POLICY IF EXISTS "chat attachments: insert by sender" ON storage.objects;
DROP POLICY IF EXISTS "chat attachments: update by sender" ON storage.objects;
DROP POLICY IF EXISTS "chat attachments: delete by sender" ON storage.objects;

-- Read allowed for sender or receiver
CREATE POLICY "chat attachments: read for sender or receiver"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat_attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Insert allowed only for sender (first folder segment)
CREATE POLICY "chat attachments: insert by sender"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat_attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update allowed only for sender
CREATE POLICY "chat attachments: update by sender"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'chat_attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete allowed only for sender
CREATE POLICY "chat attachments: delete by sender"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat_attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4) Clean up temporary permissive photo policies if they exist
DROP POLICY IF EXISTS "memory-photos-read-all" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-insert-all" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-read-all" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-insert-all" ON storage.objects;

-- 5) Messages: allow users to delete their own messages
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);

-- 6) Harden database functions search_path
CREATE OR REPLACE FUNCTION public.update_moods_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_message_delivered()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  -- Set delivered_at to current timestamp if not already set
  IF NEW.delivered_at IS NULL THEN
    NEW.delivered_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
