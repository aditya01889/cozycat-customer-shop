-- =====================================================
-- CREATE MISSING delivery_partners TABLE IN STAGING
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Create delivery_partners table (exact production schema)
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name TEXT NOT NULL,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_partners_is_active ON public.delivery_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_name ON public.delivery_partners(name);

-- Insert sample delivery partner (no conflict needed since table is likely empty)
INSERT INTO public.delivery_partners (id, name, contact_phone, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Default Delivery Partner', '+91 98765 43210', true);

-- Verify table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'delivery_partners'
ORDER BY table_name;
