-- Comprehensive PostgREST Diagnostic
-- Check all potential issues causing PGRST201 error

-- 1. Check if there are any OTHER duplicate constraints on order_items
SELECT 
    'DUPLICATE CONSTRAINTS' as issue_type,
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
    AND tc.constraint_name LIKE '%variant%'
    AND tc.constraint_name != 'order_items_product_variant_id_fkey'
ORDER BY tc.constraint_name;

-- 2. Check for any tables referenced by order_items that don't exist
SELECT 
    'MISSING REFERENCED TABLES' as issue_type,
    ccu.table_name AS referenced_table,
    COUNT(*) as constraint_count
FROM information_schema.constraint_column_usage ccu
JOIN information_schema.table_constraints tc
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'order_items'
    AND ccu.table_name NOT IN (
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    )
GROUP BY ccu.table_name
HAVING COUNT(*) > 0;

-- 3. Check if order_items has any columns that reference non-existent tables
SELECT 
    'INVALID COLUMN REFERENCES' as issue_type,
    kcu.column_name,
    ccu.table_name AS referenced_table
FROM information_schema.key_column_usage kcu
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.table_constraints tc
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'order_items'
    AND ccu.table_name NOT IN (
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    )
ORDER BY kcu.column_name;
