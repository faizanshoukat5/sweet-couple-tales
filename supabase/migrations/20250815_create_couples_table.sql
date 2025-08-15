-- Create couples table for partner relationships
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON public.couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON public.couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_status ON public.couples(status);

-- Enable RLS
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view couples they are part of" 
ON public.couples FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert couple relationships" 
ON public.couples FOR INSERT 
WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update couple relationships they are part of" 
ON public.couples FOR UPDATE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete couple relationships they are part of" 
ON public.couples FOR DELETE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_couples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER couples_updated_at_trigger
    BEFORE UPDATE ON public.couples
    FOR EACH ROW
    EXECUTE FUNCTION update_couples_updated_at();
