-- Script to clean up duplicate couple relationships
-- This will help resolve the "multiple rows returned" error

-- 1. First, let's see what duplicate couples exist
SELECT 
    user1_id, 
    user2_id, 
    status,
    COUNT(*) as count
FROM public.couples 
WHERE status = 'accepted'
GROUP BY user1_id, user2_id, status
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Check if there are bidirectional duplicates (user A->B and user B->A)
SELECT 
    c1.id as couple1_id,
    c1.user1_id as c1_user1,
    c1.user2_id as c1_user2,
    c2.id as couple2_id,
    c2.user1_id as c2_user1,
    c2.user2_id as c2_user2
FROM public.couples c1
JOIN public.couples c2 ON (
    c1.user1_id = c2.user2_id 
    AND c1.user2_id = c2.user1_id 
    AND c1.id != c2.id
)
WHERE c1.status = 'accepted' AND c2.status = 'accepted';

-- 3. Keep only one couple relationship for each pair
-- WARNING: This will delete duplicate relationships!
-- Review the results from queries above before running this

/*
-- Simple cleanup: keep the couple with the lower ID for each pair
WITH duplicate_pairs AS (
    SELECT 
        id,
        user1_id,
        user2_id,
        status,
        ROW_NUMBER() OVER (
            PARTITION BY 
                LEAST(user1_id, user2_id), 
                GREATEST(user1_id, user2_id),
                status
            ORDER BY id ASC
        ) as rn
    FROM public.couples
    WHERE status = 'accepted'
)
DELETE FROM public.couples 
WHERE id IN (
    SELECT id 
    FROM duplicate_pairs 
    WHERE rn > 1
);
*/

-- 4. After cleanup, verify no duplicates remain
SELECT 
    user1_id, 
    user2_id, 
    status,
    COUNT(*) as count
FROM public.couples 
WHERE status = 'accepted'
GROUP BY user1_id, user2_id, status
HAVING COUNT(*) > 1;
