-- Check RLS policies for photos and albums tables
-- This will help us understand why photos work for some accounts but not others

-- Check if RLS is enabled on memories table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('memories', 'albums', 'album_photos')
AND schemaname = 'public';

-- Check existing policies on memories table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('memories', 'albums', 'album_photos')
AND schemaname = 'public';

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('memories', 'albums', 'album_photos');
