-- =====================================================
-- ADD MISSING DELIVERY_NOTES COLUMN
-- =====================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xfnbhheapralprcwjvzl/sql

-- Add the missing delivery_notes column
ALTER TABLE public.customer_addresses 
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customer_addresses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
