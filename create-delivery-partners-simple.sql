-- =====================================================
-- CREATE MISSING delivery_partners TABLE IN STAGING (SIMPLE)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Create delivery_partners table (exact production schema)
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_partners_is_active ON public.delivery_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_name ON public.delivery_partners(name);

-- Verify table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'delivery_partners'
ORDER BY table_name;
