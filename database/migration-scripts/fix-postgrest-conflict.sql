-- Fix PostgREST Relationship Conflict
-- Rename order_items constraint to be more specific

-- Drop the existing constraint
ALTER TABLE "public"."order_items" 
DROP CONSTRAINT "order_items_product_variant_id_fkey";

-- Recreate with a more specific name to avoid conflicts
ALTER TABLE "public"."order_items" 
ADD CONSTRAINT "order_items_product_variant_fkey" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");

-- Verify the fix
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
    AND ccu.table_name = 'product_variants'
ORDER BY tc.table_name, tc.constraint_name;
