-- Drop cart_items constraint to resolve PostgREST conflict
-- This will leave only the order_items constraint for product_variants

-- Drop the conflicting constraint
ALTER TABLE "public"."cart_items" 
DROP CONSTRAINT "cart_items_variant_id_fkey";

-- Verify only order_items constraint remains
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
    AND ccu.table_name = 'product_variants'
ORDER BY tc.table_name, tc.constraint_name;
