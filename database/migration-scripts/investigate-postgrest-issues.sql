-- Investigate other possible causes of PGRST201 error
-- Check for views, inherited tables, and other schema objects

-- 1. Check for VIEWS that reference product_variants
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE definition ILIKE '%product_variants%'
    AND schemaname = 'public'
ORDER BY viewname;

-- 2. Check for INHERITED tables that might reference product_variants
SELECT 
    c.relname AS table_name,
    c.relkind AS table_type,
    pg_get_expr(c.relpartbound, c.oid) AS partition_bound
FROM pg_class c
WHERE c.relkind IN ('r', 'p') -- regular tables and partitioned tables
    AND c.relname IN (
        SELECT DISTINCT tc.table_name 
        FROM information_schema.table_constraints tc 
        WHERE tc.table_schema = 'public'
    )
    AND c.relname LIKE '%product%' OR c.relname LIKE '%variant%'
ORDER BY c.relname;

-- 3. Check for MATERIALIZED VIEWS referencing product_variants
SELECT 
    schemaname,
    matviewname,
    definition
FROM pg_matviews 
WHERE definition ILIKE '%product_variants%'
    AND schemaname = 'public'
ORDER BY matviewname;

-- 4. Check all constraints in ALL schemas (not just public)
SELECT 
    tc.table_schema,
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
    AND ccu.table_name = 'product_variants'
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;
