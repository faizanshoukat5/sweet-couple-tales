-- Migration: add cover_photo column to albums
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS cover_photo text;

-- Backfill cover using earliest album_photos entry per album (if any and cover empty)
WITH firsts AS (
  SELECT album_id, MIN(created_at) AS first_created
  FROM public.album_photos
  GROUP BY album_id
), chosen AS (
  SELECT ap.album_id, ap.url
  FROM public.album_photos ap
  JOIN firsts f ON f.album_id = ap.album_id AND f.first_created = ap.created_at
)
UPDATE public.albums a
SET cover_photo = c.url
FROM chosen c
WHERE a.id = c.album_id AND a.cover_photo IS NULL;

COMMENT ON COLUMN public.albums.cover_photo IS 'Storage path (not signed URL) of the selected album cover image';
