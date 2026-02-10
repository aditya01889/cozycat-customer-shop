-- Clean Orphaned Data for Existing Tables Only
-- This removes records that reference non-existent parent records

-- 1. Check orphaned product_recipes records (ingredient_id)
SELECT 
    'product_recipes' as table_name,
    COUNT(*) as orphaned_count,
    'ingredient_id' as orphaned_field
FROM product_recipes pr
LEFT JOIN ingredients i ON pr.ingredient_id = i.id
WHERE i.id IS NULL
UNION ALL
-- Check orphaned product_recipes records (product_id)
SELECT 
    'product_recipes' as table_name,
    COUNT(*) as orphaned_count,
    'product_id' as orphaned_field
FROM product_recipes pr
LEFT JOIN products p ON pr.product_id = p.id
WHERE p.id IS NULL AND pr.product_id IS NOT NULL
UNION ALL
-- Check orphaned production_batches records (product_id)
SELECT 
    'production_batches' as table_name,
    COUNT(*) as orphaned_count,
    'product_id' as orphaned_field
FROM production_batches pb
LEFT JOIN products p ON pb.product_id = p.id
WHERE p.id IS NULL AND pb.product_id IS NOT NULL
UNION ALL
-- Check orphaned production_batches records (order_id)
SELECT 
    'production_batches' as table_name,
    COUNT(*) as orphaned_count,
    'order_id' as orphaned_field
FROM production_batches pb
LEFT JOIN orders o ON pb.order_id = o.id
WHERE o.id IS NULL AND pb.order_id IS NOT NULL
UNION ALL
-- Check orphaned deliveries records (order_id)
SELECT 
    'deliveries' as table_name,
    COUNT(*) as orphaned_count,
    'order_id' as orphaned_field
FROM deliveries d
LEFT JOIN orders o ON d.order_id = o.id
WHERE o.id IS NULL AND d.order_id IS NOT NULL
UNION ALL
-- Check orphaned deliveries records (delivery_partner_id)
SELECT 
    'deliveries' as table_name,
    COUNT(*) as orphaned_count,
    'delivery_partner_id' as orphaned_field
FROM deliveries d
LEFT JOIN delivery_partners dp ON d.delivery_partner_id = dp.id
WHERE dp.id IS NULL AND d.delivery_partner_id IS NOT NULL;

-- Clean orphaned records (run only after reviewing the above counts)

-- Delete orphaned product_recipes (ingredient_id)
DELETE FROM product_recipes 
WHERE ingredient_id NOT IN (SELECT id FROM ingredients);

-- Delete orphaned product_recipes (product_id)
DELETE FROM product_recipes 
WHERE product_id NOT IN (SELECT id FROM products) AND product_id IS NOT NULL;

-- Delete orphaned production_batches (product_id)
DELETE FROM production_batches 
WHERE product_id NOT IN (SELECT id FROM products) AND product_id IS NOT NULL;

-- Delete orphaned production_batches (order_id)
DELETE FROM production_batches 
WHERE order_id NOT IN (SELECT id FROM orders) AND order_id IS NOT NULL;

-- Delete orphaned deliveries (order_id)
DELETE FROM deliveries 
WHERE order_id NOT IN (SELECT id FROM orders) AND order_id IS NOT NULL;

-- Delete orphaned deliveries (delivery_partner_id)
DELETE FROM deliveries 
WHERE delivery_partner_id NOT IN (SELECT id FROM delivery_partners) AND delivery_partner_id IS NOT NULL;

-- Verify cleanup
SELECT 'Cleanup Complete - Verification:' as status;
SELECT COUNT(*) as remaining_product_recipes FROM product_recipes;
SELECT COUNT(*) as remaining_production_batches FROM production_batches;
SELECT COUNT(*) as remaining_deliveries FROM deliveries;
