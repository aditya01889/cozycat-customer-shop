-- =====================================================
-- ADD ALL MISSING COLUMNS TO CUSTOMER_ADDRESSES TABLE
-- =====================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xfnbhheapralprcwjvzl/sql

-- Add all missing columns that the application expects
ALTER TABLE public.customer_addresses 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT;

-- Verify all columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customer_addresses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
