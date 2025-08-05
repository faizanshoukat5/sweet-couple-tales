-- Delete moods table and related objects
-- This script will clean up any existing moods table before recreating it

-- Drop the index first
drop index if exists public.moods_user_date_idx;

-- Drop the table
drop table if exists public.moods;

-- Note: This will remove all mood tracking data permanently
-- Use with caution in production environments
