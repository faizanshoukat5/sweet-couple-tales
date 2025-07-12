-- Add status and request tracking to couples table
ALTER TABLE public.couples 
ADD COLUMN status text NOT NULL DEFAULT 'pending',
ADD COLUMN requested_by uuid NOT NULL,
ADD COLUMN requested_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN responded_at timestamp with time zone NULL;

-- Add constraint for valid status values
ALTER TABLE public.couples 
ADD CONSTRAINT couples_valid_status 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Update existing rows to have a status and requested_by
UPDATE public.couples 
SET status = 'accepted', 
    requested_by = user1_id, 
    requested_at = now()
WHERE status IS NULL;