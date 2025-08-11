-- Migration: add cover_photo column to memories
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS cover_photo text;

-- Backfill cover_photo with first array element when missing
UPDATE public.memories
SET cover_photo = photos[1]
WHERE cover_photo IS NULL AND photos IS NOT NULL AND array_length(photos,1) > 0;

-- Normalize photos: strip public URL prefix to leave only storage path
UPDATE public.memories
SET photos = (
  SELECT array_agg(
    CASE WHEN p LIKE '%/storage/v1/object/public/memory-photos/%'
         THEN split_part(p, '/storage/v1/object/public/memory-photos/', 2)
         ELSE p END
  )
  FROM unnest(photos) AS p
)
WHERE EXISTS (
  SELECT 1 FROM unnest(photos) AS p2 WHERE p2 LIKE '%/storage/v1/object/public/memory-photos/%'
);

-- Normalize cover_photo similarly
UPDATE public.memories
SET cover_photo = split_part(cover_photo, '/storage/v1/object/public/memory-photos/', 2)
WHERE cover_photo LIKE '%/storage/v1/object/public/memory-photos/%';

COMMENT ON COLUMN public.memories.cover_photo IS 'Storage path of the selected cover image for the memory';
