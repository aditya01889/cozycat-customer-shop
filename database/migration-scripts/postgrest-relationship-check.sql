-- Check what PostgREST actually sees for relationships
-- This simulates how PostgREST detects relationships

-- Check all relationships PostgREST would detect
SELECT 
    'POSTGREST RELATIONSHIPS' as check_type,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    -- Create relationship name that PostgREST would use
    CASE 
        WHEN tc.table_name = 'order_items' AND ccu.table_name = 'product_variants' 
        THEN 'order_items.product_variants'
        WHEN tc.table_name = 'order_items' AND ccu.table_name = 'products'
        THEN 'order_items.products'
        WHEN tc.table_name = 'production_batches' AND ccu.table_name = 'products'
        THEN 'production_batches.products'
        WHEN tc.table_name = 'production_batches' AND ccu.table_name = 'orders'
        THEN 'production_batches.orders'
        ELSE tc.table_name || '.' || ccu.table_name
    END as postgrest_relationship
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('order_items', 'production_batches')
ORDER BY tc.table_name, postgrest_relationship;
