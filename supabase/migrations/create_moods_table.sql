-- Create moods table for tracking daily moods of both partners
CREATE TABLE IF NOT EXISTS public.moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'excited', 'neutral', 'sad', 'angry', 'loved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, date)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS moods_user_date_idx ON public.moods(user_id, date);

-- Enable RLS
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own moods" ON public.moods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moods" ON public.moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods" ON public.moods
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for partners to view each other's moods
CREATE POLICY "Partners can view each other's moods" ON public.moods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples 
      WHERE status = 'accepted' AND (
        (user1_id = auth.uid() AND user2_id = moods.user_id)
        OR (user2_id = auth.uid() AND user1_id = moods.user_id)
      )
    )
  );
