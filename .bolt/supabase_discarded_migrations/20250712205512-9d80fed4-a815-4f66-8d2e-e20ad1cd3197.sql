-- First, let's see what duplicates exist and clean them up
-- Delete duplicate entries, keeping only the first one for each unique pair
DELETE FROM public.couples a
USING public.couples b
WHERE a.id > b.id 
  AND a.user1_id = b.user1_id 
  AND a.user2_id = b.user2_id;

-- Also handle the case where the same pair might exist in reverse order
-- (user1_id, user2_id) vs (user2_id, user1_id)
DELETE FROM public.couples a
USING public.couples b
WHERE a.id > b.id 
  AND a.user1_id = b.user2_id 
  AND a.user2_id = b.user1_id;