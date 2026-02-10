-- Fix PostgREST column naming conflict
-- Rename conflicting columns to prevent false relationship detection

-- 1. Rename variant_id column to avoid conflict with product_variants
ALTER TABLE "public"."order_items" 
RENAME COLUMN "variant_id" TO "legacy_variant_id";

-- 2. Verify the changes
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
