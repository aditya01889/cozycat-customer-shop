-- Fix Duplicate Foreign Key Constraints
-- Remove duplicate constraint that's causing PGRST201 error

-- Drop the duplicate/incorrect constraint
ALTER TABLE "public"."order_items" 
DROP CONSTRAINT IF EXISTS "order_items_variant_id_fkey";

-- Verify only correct constraint remains
SELECT 
    tc.table_name, 
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'order_items'
    AND tc.constraint_name LIKE '%product_variant%'
ORDER BY tc.constraint_name;
