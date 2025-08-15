-- SETUP SCRIPT FOR PERIOD CYCLES TABLE
-- Run this script in Supabase SQL Editor to fix the period_cycles table schema

-- First, check if the table exists and what columns it has
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'period_cycles') THEN
        RAISE NOTICE 'period_cycles table exists, checking schema...';
        
        -- Check if user_id column exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'period_cycles' AND column_name = 'user_id') THEN
            RAISE NOTICE 'period_cycles table has user_id column - schema is correct!';
        ELSE
            RAISE NOTICE 'period_cycles table exists but missing user_id column - needs to be recreated';
            -- Drop and recreate with correct schema
            DROP TABLE IF EXISTS public.period_cycles CASCADE;
        END IF;
    ELSE
        RAISE NOTICE 'period_cycles table does not exist - will create it';
    END IF;
END $$;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cycle data" ON public.period_cycles;
DROP POLICY IF EXISTS "Users can insert their own cycle data" ON public.period_cycles;
DROP POLICY IF EXISTS "Users can update their own cycle data" ON public.period_cycles;
DROP POLICY IF EXISTS "Users can delete their own cycle data" ON public.period_cycles;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS period_cycles_updated_at_trigger ON public.period_cycles;

-- Create trigger for updated_at
CREATE TRIGGER period_cycles_updated_at_trigger
    BEFORE UPDATE ON public.period_cycles
    FOR EACH ROW
    EXECUTE FUNCTION update_period_cycles_updated_at();

-- Verify the table was created correctly
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'period_cycles' AND column_name = 'user_id') THEN
        RAISE NOTICE 'SUCCESS: period_cycles table created with user_id column!';
    ELSE
        RAISE EXCEPTION 'FAILED: period_cycles table does not have user_id column';
    END IF;
END $$;
