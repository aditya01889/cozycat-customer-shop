-- Check for multiple columns in order_items that might reference product_variants
-- This could cause PGRST201 even with single FK constraint

-- 1. Check all columns in order_items table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'order_items'
    AND (column_name ILIKE '%variant%' OR column_name ILIKE '%product%')
ORDER BY column_name;

-- 2. Check if there are any other columns that could reference product_variants
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' AND column_name ILIKE '%variant%' 
        THEN 'POTENTIAL VARIANT REFERENCE'
        WHEN data_type = 'uuid' AND column_name ILIKE '%product%' 
        THEN 'POTENTIAL PRODUCT REFERENCE'
        ELSE 'OTHER'
    END as potential_issue
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'order_items'
    AND data_type = 'uuid'
ORDER BY column_name;
