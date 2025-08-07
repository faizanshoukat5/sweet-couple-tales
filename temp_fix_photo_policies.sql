-- Temporary fix: Allow all authenticated users to read photos
-- This is for testing only - use fix_photo_policies.sql for production

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Partners can view each other's memories" ON public.memories;
DROP POLICY IF EXISTS "Users can view their own albums" ON public.albums;
DROP POLICY IF EXISTS "Partners can view each other's albums" ON public.albums;
DROP POLICY IF EXISTS "Users can view album photos they have access to" ON public.album_photos;

-- Create permissive policies for testing
CREATE POLICY "Allow all authenticated users to read memories" 
ON public.memories FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to read albums" 
ON public.albums FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to read album photos" 
ON public.album_photos FOR SELECT 
USING (auth.role() = 'authenticated');

-- Keep write policies restricted to own data
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;
CREATE POLICY "Users can insert their own memories" 
ON public.memories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own albums" ON public.albums;
CREATE POLICY "Users can insert their own albums" 
ON public.albums FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert photos into any album" ON public.album_photos;
CREATE POLICY "Users can insert photos into any album" 
ON public.album_photos FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Clean up storage policies and make them permissive for testing
-- Note: Storage policies in Supabase are managed through the dashboard or specific functions

-- For memory-photos bucket
DROP POLICY IF EXISTS "memory-photos-read-all" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-insert-all" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-read-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-insert-own" ON storage.objects;

CREATE POLICY "memory-photos-read-all" ON storage.objects
FOR SELECT USING (bucket_id = 'memory-photos' AND auth.role() = 'authenticated');

CREATE POLICY "memory-photos-insert-all" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'memory-photos' AND auth.role() = 'authenticated');

-- For album-photos bucket
DROP POLICY IF EXISTS "album-photos-read-all" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-insert-all" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-read-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-insert-own" ON storage.objects;

CREATE POLICY "album-photos-read-all" ON storage.objects
FOR SELECT USING (bucket_id = 'album-photos' AND auth.role() = 'authenticated');

CREATE POLICY "album-photos-insert-all" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'album-photos' AND auth.role() = 'authenticated');
