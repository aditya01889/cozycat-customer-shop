-- Check primary key status for all existing tables
SELECT 
    t.table_name,
    CASE WHEN pk.column_name IS NOT NULL THEN 'HAS PK' ELSE 'MISSING PK' END as pk_status,
    COALESCE(pk.column_name, 'NONE') as pk_column
FROM information_schema.tables t
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
) pk ON t.table_name = pk.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
        'cart_items', 'categories', 'customer_addresses', 'customers', 
        'deliveries', 'delivery_partners', 'ingredients', 'order_items', 
        'orders', 'product_recipes', 'product_variants', 'production_batches', 
        'products', 'profiles', 'settings', 'vendors'
    )
ORDER BY t.table_name;
