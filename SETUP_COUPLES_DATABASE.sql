-- Manual setup script for couples and love_notes tables
-- Run this in your Supabase SQL editor if tables don't exist

-- 1. Create couples table
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON public.couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON public.couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_status ON public.couples(status);

-- 3. Enable RLS
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for couples
DROP POLICY IF EXISTS "Users can view couples they are part of" ON public.couples;
CREATE POLICY "Users can view couples they are part of" 
ON public.couples FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can insert couple relationships" ON public.couples;
CREATE POLICY "Users can insert couple relationships" 
ON public.couples FOR INSERT 
WITH CHECK (auth.uid() = user1_id);

DROP POLICY IF EXISTS "Users can update couple relationships they are part of" ON public.couples;
CREATE POLICY "Users can update couple relationships they are part of" 
ON public.couples FOR UPDATE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can delete couple relationships they are part of" ON public.couples;
CREATE POLICY "Users can delete couple relationships they are part of" 
ON public.couples FOR DELETE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 5. Create love_notes table
CREATE TABLE IF NOT EXISTS public.love_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for love_notes
CREATE INDEX IF NOT EXISTS idx_love_notes_couple_id ON public.love_notes(couple_id);
CREATE INDEX IF NOT EXISTS idx_love_notes_author_id ON public.love_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_love_notes_created_at ON public.love_notes(created_at);

-- 7. Enable RLS for love_notes
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for love_notes
DROP POLICY IF EXISTS "Users can view notes from their couple" ON public.love_notes;
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

DROP POLICY IF EXISTS "Users can insert notes to their couple" ON public.love_notes;
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

DROP POLICY IF EXISTS "Users can update their own notes" ON public.love_notes;
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

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.love_notes;
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

-- 9. Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_couples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_love_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers
DROP TRIGGER IF EXISTS couples_updated_at_trigger ON public.couples;
CREATE TRIGGER couples_updated_at_trigger
    BEFORE UPDATE ON public.couples
    FOR EACH ROW
    EXECUTE FUNCTION update_couples_updated_at();

DROP TRIGGER IF EXISTS love_notes_updated_at_trigger ON public.love_notes;
CREATE TRIGGER love_notes_updated_at_trigger
    BEFORE UPDATE ON public.love_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_love_notes_updated_at();

-- Success message
SELECT 'Tables created successfully! Now you can add couple relationships and love notes.' AS status;
