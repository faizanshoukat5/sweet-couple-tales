-- Now add the unique constraint to prevent duplicate couples relationships
ALTER TABLE public.couples 
ADD CONSTRAINT couples_unique_pair 
UNIQUE (user1_id, user2_id);

-- Also add a check constraint to prevent a user from being paired with themselves
ALTER TABLE public.couples 
ADD CONSTRAINT couples_no_self_pair 
CHECK (user1_id != user2_id);