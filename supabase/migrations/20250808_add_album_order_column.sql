-- Add an 'order' column to albums for persistent drag-and-drop
ALTER TABLE albums ADD COLUMN "order" integer;

-- Set default order for existing albums (by created_at)
UPDATE albums SET "order" = (
  SELECT row_number() OVER (ORDER BY created_at) - 1
);

-- Make sure new albums get a default order value (highest + 1)
CREATE OR REPLACE FUNCTION set_album_order()
RETURNS TRIGGER AS $$
BEGIN
  NEW."order" := COALESCE((SELECT MAX("order") FROM albums), -1) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_album_order_trigger ON albums;
CREATE TRIGGER set_album_order_trigger
BEFORE INSERT ON albums
FOR EACH ROW EXECUTE FUNCTION set_album_order();
