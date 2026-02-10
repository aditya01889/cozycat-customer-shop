-- Check if critical tables exist and have primary keys
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    CASE WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY' ELSE 'NO PK' END as pk_status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public'
    AND t.table_name IN (
        'ingredients', 
        'products', 
        'orders', 
        'production_batches',
        'deliveries',
        'delivery_partners',
        'vendors',
        'categories',
        'product_variants'
    )
ORDER BY t.table_name, c.ordinal_position;
