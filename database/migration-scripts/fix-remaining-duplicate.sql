-- Fix Remaining Duplicate Foreign Key Constraint
-- Remove the duplicate constraint that's still causing PGRST201

-- Drop the duplicate/incorrect constraint
ALTER TABLE "public"."order_items" 
DROP CONSTRAINT IF EXISTS "order_items_variant_id_fkey";

-- Verify only correct constraints remain
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'order_items'
    AND tc.constraint_name LIKE '%product_variant%'
ORDER BY tc.constraint_name, kcu.ordinal_position;
