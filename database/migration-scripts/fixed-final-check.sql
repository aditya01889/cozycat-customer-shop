-- Fixed comprehensive check for ALL product_variants constraints
-- This will find any remaining hidden constraints

SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    -- Count how many constraints each table has to product_variants
    COUNT(*) OVER (PARTITION BY tc.table_name) as constraint_count
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'product_variants'
GROUP BY tc.table_name, tc.constraint_name, kcu.column_name
ORDER BY tc.table_name, constraint_count DESC, tc.constraint_name;
