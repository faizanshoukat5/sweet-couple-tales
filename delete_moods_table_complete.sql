-- =====================================================
-- DELETE MOODS TABLE - COMPLETE CLEANUP
-- =====================================================
-- WARNING: This will permanently delete all mood tracking data!
-- Run this script ONLY if you want to completely remove the moods table

-- Step 1: Drop all policies
DROP POLICY IF EXISTS "Users can view their own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can insert their own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can update their own moods" ON public.moods;
DROP POLICY IF EXISTS "Partners can view each other's moods" ON public.moods;

-- Step 2: Disable Row Level Security
ALTER TABLE IF EXISTS public.moods DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all indexes
DROP INDEX IF EXISTS public.moods_user_date_idx;

-- Step 4: Drop the entire table (CASCADE removes any dependencies)
DROP TABLE IF EXISTS public.moods CASCADE;

-- Confirmation message
SELECT 'Moods table and all related data have been completely removed!' as status;
