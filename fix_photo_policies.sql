-- Fix RLS policies for memories, albums, and album_photos tables
-- This will allow users to view their own photos and their partner's photos

-- Enable RLS on memories table
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memories
CREATE POLICY IF NOT EXISTS "Users can view their own memories" 
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

-- Policy: Partners can view each other's memories ONLY if shared
DROP POLICY IF EXISTS "Partners can view each other's memories" ON public.memories;
CREATE POLICY "Partners can view each other's shared memories" 
ON public.memories FOR SELECT 
USING (
  is_shared = true AND EXISTS (
    SELECT 1 FROM public.couples 
    WHERE (user1_id = auth.uid() AND user2_id = memories.user_id AND status = 'accepted')
    OR (user2_id = auth.uid() AND user1_id = memories.user_id AND status = 'accepted')
  )
);

-- Enable RLS on albums table
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own albums
CREATE POLICY IF NOT EXISTS "Users can view their own albums" 
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

-- Policy: Partners can view each other's albums ONLY if shared
DROP POLICY IF EXISTS "Partners can view each other's albums" ON public.albums;
CREATE POLICY "Partners can view each other's shared albums" 
ON public.albums FOR SELECT 
USING (
  is_shared = true AND EXISTS (
    SELECT 1 FROM public.couples 
    WHERE (user1_id = auth.uid() AND user2_id = albums.user_id AND status = 'accepted')
    OR (user2_id = auth.uid() AND user1_id = albums.user_id AND status = 'accepted')
  )
);

-- Enable RLS on album_photos table
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view album photos for albums they own or SHARED albums from their partner
DROP POLICY IF EXISTS "Users can view album photos they have access to" ON public.album_photos;
CREATE POLICY "Users can view album photos they have access to" 
ON public.album_photos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_photos.album_id 
    AND (
      albums.user_id = auth.uid()
      OR (
        albums.is_shared = true AND EXISTS (
          SELECT 1 FROM public.couples 
          WHERE (user1_id = auth.uid() AND user2_id = albums.user_id AND status = 'accepted')
          OR (user2_id = auth.uid() AND user1_id = albums.user_id AND status = 'accepted')
        )
      )
    )
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

-- Storage policies for memory-photos bucket
-- Allow users to read their own photos and their partner's photos
DROP POLICY IF EXISTS "memory-photos-read-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-read-partner" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-insert-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-update-own" ON storage.objects;
DROP POLICY IF EXISTS "memory-photos-delete-own" ON storage.objects;

CREATE POLICY "memory-photos-read-own" ON storage.objects
FOR SELECT USING (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "memory-photos-read-partner" ON storage.objects
FOR SELECT USING (
  bucket_id = 'memory-photos' 
  AND EXISTS (
    SELECT 1 FROM public.couples 
    WHERE (
      (user1_id = auth.uid() AND user2_id = ((storage.foldername(name))[1])::uuid AND status = 'accepted')
      OR (user2_id = auth.uid() AND user1_id = ((storage.foldername(name))[1])::uuid AND status = 'accepted')
    )
  )
);

CREATE POLICY "memory-photos-insert-own" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "memory-photos-update-own" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "memory-photos-delete-own" ON storage.objects
FOR DELETE USING (
  bucket_id = 'memory-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for album-photos bucket
DROP POLICY IF EXISTS "album-photos-read-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-read-partner" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-insert-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-update-own" ON storage.objects;
DROP POLICY IF EXISTS "album-photos-delete-own" ON storage.objects;

CREATE POLICY "album-photos-read-own" ON storage.objects
FOR SELECT USING (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "album-photos-read-partner" ON storage.objects
FOR SELECT USING (
  bucket_id = 'album-photos' 
  AND EXISTS (
    SELECT 1 FROM public.couples 
    WHERE (
      (user1_id = auth.uid() AND user2_id = ((storage.foldername(name))[1])::uuid AND status = 'accepted')
      OR (user2_id = auth.uid() AND user1_id = ((storage.foldername(name))[1])::uuid AND status = 'accepted')
    )
  )
);

CREATE POLICY "album-photos-insert-own" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "album-photos-update-own" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "album-photos-delete-own" ON storage.objects
FOR DELETE USING (
  bucket_id = 'album-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
