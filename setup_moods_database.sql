-- =====================================================
-- MOOD TRACKER TABLE SETUP
-- =====================================================
-- Run this script in Supabase SQL Editor
-- This will first clean up any existing moods table, then create a new one

-- STEP 1: Complete cleanup of existing moods table
-- =====================================================

-- Drop all existing policies first (if any)
DROP POLICY IF EXISTS "Users can view their own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can insert their own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can update their own moods" ON public.moods;
DROP POLICY IF EXISTS "Partners can view each other's moods" ON public.moods;

-- Disable RLS (if enabled)
ALTER TABLE IF EXISTS public.moods DISABLE ROW LEVEL SECURITY;

-- Drop existing indexes (if any)
DROP INDEX IF EXISTS public.moods_user_date_idx;

-- Drop the entire table and all its data
DROP TABLE IF EXISTS public.moods CASCADE;

-- STEP 2: Create new moods table with complete schema
-- =====================================================

-- Create moods table for tracking daily moods of both partners
CREATE TABLE IF NOT EXISTS public.moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'excited', 'neutral', 'sad', 'angry', 'loved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, date)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS moods_user_date_idx ON public.moods(user_id, date);

-- Enable RLS
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own moods" ON public.moods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moods" ON public.moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods" ON public.moods
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for partners to view each other's moods
CREATE POLICY "Partners can view each other's moods" ON public.moods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples 
      WHERE status = 'accepted' AND (
        (user1_id = auth.uid() AND user2_id = moods.user_id)
        OR (user2_id = auth.uid() AND user1_id = moods.user_id)
      )
    )
  );

-- =====================================================
-- VERIFICATION QUERIES (Optional - run to verify)
-- =====================================================

-- Check if table was created successfully
-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'moods' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check if RLS is enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'moods' AND schemaname = 'public';

-- Check policies
-- SELECT policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'moods' AND schemaname = 'public';
