-- Fix period cycles table schema to match CycleTrackerCard component
-- Drop existing table if it exists with wrong schema
DROP TABLE IF EXISTS public.period_cycles CASCADE;

-- Enhanced period cycle tracking table with correct schema
CREATE TABLE IF NOT EXISTS public.period_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cycle_start_date DATE NOT NULL,
    cycle_length INTEGER NOT NULL DEFAULT 28 CHECK (cycle_length BETWEEN 20 AND 60),
    period_length INTEGER NOT NULL DEFAULT 5 CHECK (period_length BETWEEN 1 AND 14),
    symptoms TEXT[] DEFAULT '{}',
    mood TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_period_cycles_user_id ON public.period_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_period_cycles_start_date ON public.period_cycles(cycle_start_date);

-- Enable RLS
ALTER TABLE public.period_cycles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cycle data" 
ON public.period_cycles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle data" 
ON public.period_cycles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle data" 
ON public.period_cycles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycle data" 
ON public.period_cycles FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_period_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER period_cycles_updated_at_trigger
    BEFORE UPDATE ON public.period_cycles
    FOR EACH ROW
    EXECUTE FUNCTION update_period_cycles_updated_at();
