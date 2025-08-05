-- =====================================================
-- CREATE MOODS TABLE - FRESH INSTALLATION
-- =====================================================
-- Run this script AFTER running the delete script
-- This creates a completely new moods table with all features

-- Create moods table for tracking daily moods of both partners
CREATE TABLE public.moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'excited', 'neutral', 'sad', 'angry', 'loved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, date)
);

-- Create index for fast lookups by user and date
CREATE INDEX moods_user_date_idx ON public.moods(user_id, date);

-- Create index for date-based queries
CREATE INDEX moods_date_idx ON public.moods(date);

-- Enable Row Level Security
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own moods
CREATE POLICY "Users can view their own moods" ON public.moods
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own moods
CREATE POLICY "Users can insert their own moods" ON public.moods
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own moods
CREATE POLICY "Users can update their own moods" ON public.moods
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own moods
CREATE POLICY "Users can delete their own moods" ON public.moods
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy 5: Partners can view each other's moods (only in accepted relationships)
CREATE POLICY "Partners can view each other's moods" ON public.moods
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.couples 
      WHERE status = 'accepted' AND (
        (user1_id = auth.uid() AND user2_id = moods.user_id)
        OR (user2_id = auth.uid() AND user1_id = moods.user_id)
      )
    )
  );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_moods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_moods_updated_at_trigger
  BEFORE UPDATE ON public.moods
  FOR EACH ROW
  EXECUTE FUNCTION update_moods_updated_at();

-- Confirmation message
SELECT 'Moods table created successfully with all policies and triggers!' as status;
