-- ADD SAMPLE ORDER_ITEMS DATA FOR EXISTING ORDERS
-- Execute this SQL in Supabase Dashboard > SQL Editor on STAGING database
-- This will create order_items records for existing orders so the LEFT JOIN returns data

-- ==========================================
-- STEP 1: Add sample order_items for existing orders
-- ==========================================
INSERT INTO order_items (id, order_id, product_variant_id, quantity, price, total_price, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    o.id as order_id,
    pv.id as product_variant_id,
    1 as quantity,
    COALESCE(o.total_amount, 29.99) as price,
    COALESCE(o.total_amount, 29.99) as total_price,
    o.created_at,
    NOW() as updated_at
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM product_variants pv 
    WHERE pv.product_id = (
        SELECT id FROM products ORDER BY RANDOM() LIMIT 1
    ) LIMIT 1
) pv
WHERE o.status IN ('pending', 'confirmed', 'processing')
  AND o.id IN (
    '00b2483c-1fdf-4516-9bd9-92178b7b545b',
    '039892e3-b4e4-4ebd-ab7b-1d42302ddaa3',
    '09a21282-b781-4b46-968c-74ec4c5212c1'
  )
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 2: Verify the data was added
-- ==========================================
SELECT 'order_items after adding sample data' as info, 
       oi.id,
       oi.order_id,
       oi.product_variant_id,
       oi.quantity,
       oi.price,
       oi.total_price,
       pv.id as variant_id,
       p.name as product_name
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
LEFT JOIN products p ON pv.product_id = p.id
WHERE o.status IN ('pending', 'confirmed', 'processing')
  AND o.id IN (
    '00b2483c-1fdf-4516-9bd9-92178b7b545b',
    '039892e3-b4e4-4ebd-ab7b-1d42302ddaa3',
    '09a21282-b781-4b46-968c-74ec4c5212c1'
  )
ORDER BY o.id;
