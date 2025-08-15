-- Create love_notes table for couple notes
CREATE TABLE IF NOT EXISTS public.love_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_love_notes_couple_id ON public.love_notes(couple_id);
CREATE INDEX IF NOT EXISTS idx_love_notes_author_id ON public.love_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_love_notes_created_at ON public.love_notes(created_at);

-- Enable RLS
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view notes from their couple" 
ON public.love_notes FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.couples 
        WHERE couples.id = love_notes.couple_id 
        AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        AND couples.status = 'accepted'
    )
);

CREATE POLICY "Users can insert notes to their couple" 
ON public.love_notes FOR INSERT 
WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
        SELECT 1 FROM public.couples 
        WHERE couples.id = love_notes.couple_id 
        AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        AND couples.status = 'accepted'
    )
);

CREATE POLICY "Users can update their own notes" 
ON public.love_notes FOR UPDATE 
USING (
    auth.uid() = author_id
    AND EXISTS (
        SELECT 1 FROM public.couples 
        WHERE couples.id = love_notes.couple_id 
        AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        AND couples.status = 'accepted'
    )
);

CREATE POLICY "Users can delete their own notes" 
ON public.love_notes FOR DELETE 
USING (
    auth.uid() = author_id
    AND EXISTS (
        SELECT 1 FROM public.couples 
        WHERE couples.id = love_notes.couple_id 
        AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        AND couples.status = 'accepted'
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_love_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER love_notes_updated_at_trigger
    BEFORE UPDATE ON public.love_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_love_notes_updated_at();
