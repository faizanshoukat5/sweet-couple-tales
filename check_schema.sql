-- Check if memories and albums tables have is_shared column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'memories' 
AND table_schema = 'public';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'albums' 
AND table_schema = 'public';

-- If is_shared column doesn't exist, add it
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
