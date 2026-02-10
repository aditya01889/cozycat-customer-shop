-- Diagnose what tables exist in your staging database
-- This will help us understand what's missing

-- 1. Check what tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check specifically for our target tables
SELECT 
    'ingredients' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ingredients') as exists,
    'Should exist for product_ingredients foreign key' as note
UNION ALL
SELECT 
    'categories' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') as exists,
    'Needed for products foreign key' as note
UNION ALL
SELECT 
    'customers' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') as exists,
    'Needed for orders foreign key' as note
UNION ALL
SELECT 
    'product_ingredients' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_ingredients') as exists,
    'References ingredients and products' as note
UNION ALL
SELECT 
    'products' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') as exists,
    'Should exist from your existing data' as note
UNION ALL
SELECT 
    'product_variants' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') as exists,
    'Should exist from your existing data' as note
UNION ALL
SELECT 
    'orders' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') as exists,
    'Should exist from your existing data' as note
UNION ALL
SELECT 
    'production_batches' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'production_batches') as exists,
    'Should exist from your existing data' as note
UNION ALL
SELECT 
    'deliveries' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deliveries') as exists,
    'Should exist from your existing data' as note
UNION ALL
SELECT 
    'delivery_partners' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_partners') as exists,
    'Should exist from your existing data' as note;

-- 3. Check if this is a completely empty database
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
