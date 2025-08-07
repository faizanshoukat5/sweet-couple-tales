-- SECURE PRIVACY POLICIES - Users can ONLY see their own data
-- No partner access for maximum privacy

-- Enable RLS on memories table
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can ONLY view their own memories (no partner access)
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Partners can view each other's memories" ON public.memories;
DROP POLICY IF EXISTS "Partners can view each other's shared memories" ON public.memories;

CREATE POLICY "Users can view ONLY their own memories" 
ON public.memories FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own memories
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;
CREATE POLICY "Users can insert their own memories" 
ON public.memories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own memories
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
CREATE POLICY "Users can update their own memories" 
ON public.memories FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own memories
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;
CREATE POLICY "Users can delete their own memories" 
ON public.memories FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on albums table
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Policy: Users can ONLY view their own albums (no partner access)
DROP POLICY IF EXISTS "Users can view their own albums" ON public.albums;
DROP POLICY IF EXISTS "Partners can view each other's albums" ON public.albums;
DROP POLICY IF EXISTS "Partners can view each other's shared albums" ON public.albums;

CREATE POLICY "Users can view ONLY their own albums" 
ON public.albums FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own albums
DROP POLICY IF EXISTS "Users can insert their own albums" ON public.albums;
CREATE POLICY "Users can insert their own albums" 
ON public.albums FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own albums
DROP POLICY IF EXISTS "Users can update their own albums" ON public.albums;
CREATE POLICY "Users can update their own albums" 
ON public.albums FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own albums
DROP POLICY IF EXISTS "Users can delete their own albums" ON public.albums;
CREATE POLICY "Users can delete their own albums" 
ON public.albums FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on album_photos table
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can ONLY view photos in their own albums
DROP POLICY IF EXISTS "Users can view album photos they have access to" ON public.album_photos;
CREATE POLICY "Users can view ONLY their own album photos" 
ON public.album_photos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_photos.album_id 
    AND albums.user_id = auth.uid()
  )
);

-- Policy: Users can insert photos into their own albums
DROP POLICY IF EXISTS "Users can insert photos into their own albums" ON public.album_photos;
CREATE POLICY "Users can insert photos into their own albums" 
ON public.album_photos FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_photos.album_id 
    AND albums.user_id = auth.uid()
  )
);

-- Policy: Users can update photos in their own albums
DROP POLICY IF EXISTS "Users can update photos in their own albums" ON public.album_photos;
CREATE POLICY "Users can update photos in their own albums" 
ON public.album_photos FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_photos.album_id 
    AND albums.user_id = auth.uid()
  )
);

-- Policy: Users can delete photos from their own albums
DROP POLICY IF EXISTS "Users can delete photos from their own albums" ON public.album_photos;
CREATE POLICY "Users can delete photos from their own albums" 
ON public.album_photos FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_photos.album_id 
    AND albums.user_id = auth.uid()
  )
);

-- Storage policies - Users can ONLY access their own photos
-- For memory-photos bucket
DROP POLICY IF EXISTS "memory-photos-read-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-read-partner" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-insert-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-update-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-delete-own" ON storage.objects;

CREATE POLICY "memory-photos-read-own-only" ON storage.objects
FOR SELECT USING (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "memory-photos-insert-own-only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "memory-photos-update-own-only" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "memory-photos-delete-own-only" ON storage.objects
FOR DELETE USING (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- For album-photos bucket
DROP POLICY IF EXISTS "album-photos-read-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-read-partner" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-insert-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-update-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-delete-own" ON storage.objects;

CREATE POLICY "album-photos-read-own-only" ON storage.objects
FOR SELECT USING (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "album-photos-insert-own-only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "album-photos-update-own-only" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "album-photos-delete-own-only" ON storage.objects
FOR DELETE USING (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
