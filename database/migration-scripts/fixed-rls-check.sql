-- Fixed RLS policy check
-- Check for policies blocking operations data

-- 1. Check all RLS policies on operations tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('orders', 'order_items', 'products', 'product_variants', 'production_batches', 'deliveries')
ORDER BY tablename, policyname;

-- 2. Check if RLS is enabled on key tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('orders', 'order_items', 'products', 'product_variants', 'production_batches', 'deliveries')
ORDER BY tablename;

-- 3. Test direct query to see if data is accessible
SELECT 
    'orders_count' as metric,
    COUNT(*) as count
FROM "public"."orders"
WHERE status IS NOT NULL;
