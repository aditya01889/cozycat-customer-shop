-- Final PostgREST fix after column rename
-- Force cache reload and verify relationships

-- 1. Force PostgREST to reload schema completely
NOTIFY pgrst, 'reload schema';

-- 2. Verify only one relationship to product_variants remains
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
