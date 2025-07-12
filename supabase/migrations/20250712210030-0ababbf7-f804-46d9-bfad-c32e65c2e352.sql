-- First add the columns as nullable
ALTER TABLE public.couples 
ADD COLUMN status text DEFAULT 'pending',
ADD COLUMN requested_by uuid,
ADD COLUMN requested_at timestamp with time zone DEFAULT now(),
ADD COLUMN responded_at timestamp with time zone;

-- Update existing rows first
UPDATE public.couples 
SET status = 'accepted', 
    requested_by = user1_id, 
    requested_at = now()
WHERE requested_by IS NULL;

-- Now make the required columns NOT NULL
ALTER TABLE public.couples 
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN requested_by SET NOT NULL,
ALTER COLUMN requested_at SET NOT NULL;

-- Add constraint for valid status values
ALTER TABLE public.couples 
ADD CONSTRAINT couples_valid_status 
CHECK (status IN ('pending', 'accepted', 'rejected'));