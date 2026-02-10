-- Investigate data issues that might cause PGRST201
-- Check for stale/orphaned data affecting operations pages

-- 1. Check if order_items has any data
SELECT 
    COUNT(*) as total_order_items,
    COUNT(DISTINCT order_id) as unique_orders,
    COUNT(DISTINCT product_variant_id) as unique_variants,
    COUNT(DISTINCT product_id) as unique_products,
    COUNT(DISTINCT legacy_variant_id) as unique_legacy_variants
FROM "public"."order_items";

-- 2. Check if product_variants has any data
SELECT 
    COUNT(*) as total_product_variants,
    COUNT(DISTINCT id) as unique_variant_ids
FROM "public"."product_variants";

-- 3. Check for orphaned order_items (referencing non-existent variants)
SELECT 
    COUNT(*) as orphaned_order_items,
    COUNT(DISTINCT oi.order_id) as affected_orders
FROM "public"."order_items" oi
LEFT JOIN "public"."product_variants" pv ON oi.product_variant_id = pv.id
WHERE pv.id IS NULL;

-- 4. Check for orphaned order_items (referencing non-existent products)
SELECT 
    COUNT(*) as orphaned_by_product,
    COUNT(DISTINCT oi.order_id) as affected_orders_by_product
FROM "public"."order_items" oi
LEFT JOIN "public"."products" p ON oi.product_id = p.id
WHERE p.id IS NULL;

-- 5. Check if orders table has data
SELECT 
    COUNT(*) as total_orders,
    COUNT(DISTINCT status) as unique_statuses
FROM "public"."orders";
