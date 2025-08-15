-- Test data for couples table
-- Replace the UUIDs below with actual user IDs from your auth.users table

-- First, check what users exist:
-- SELECT id, email FROM auth.users LIMIT 5;

-- Example: Create an accepted couple relationship
-- Replace 'user1-uuid-here' and 'user2-uuid-here' with real UUIDs from your users
/*
INSERT INTO public.couples (user1_id, user2_id, status)
VALUES 
  ('user1-uuid-here', 'user2-uuid-here', 'accepted')
ON CONFLICT (user1_id, user2_id) DO NOTHING;
*/

-- To find your user IDs, run this query in Supabase SQL editor:
SELECT 
  id as user_id, 
  email, 
  created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Then use those IDs to create a couple relationship:
-- Example (DO NOT RUN AS-IS - replace with real UUIDs):
-- INSERT INTO public.couples (user1_id, user2_id, status)
-- VALUES 
--   ('3fd6b11a-477f-4952-aa2b-a5ca0d73869c', 'another-real-uuid-here', 'accepted');

-- Verify the couple was created:
-- SELECT * FROM public.couples;
