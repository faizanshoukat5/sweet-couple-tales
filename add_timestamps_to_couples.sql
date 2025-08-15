-- Add missing timestamp columns to existing couples table
-- Run this if your couples table exists but doesn't have created_at/updated_at columns

-- 1. Add the missing columns
ALTER TABLE public.couples 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update existing rows to have timestamps (if they're NULL)
UPDATE public.couples 
SET 
    created_at = NOW(),
    updated_at = NOW()
WHERE created_at IS NULL OR updated_at IS NULL;

-- 3. Create the update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_couples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS couples_updated_at_trigger ON public.couples;
CREATE TRIGGER couples_updated_at_trigger
    BEFORE UPDATE ON public.couples
    FOR EACH ROW
    EXECUTE FUNCTION update_couples_updated_at();

-- 5. Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'couples' 
ORDER BY ordinal_position;
