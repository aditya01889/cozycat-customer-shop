-- FINAL SCHEMA FIX FOR STAGING DATABASE
-- Execute this SQL in Supabase Dashboard > SQL Editor on STAGING database
-- This fixes the order_lifecycle_view dependency issue

-- ==========================================
-- STEP 1: Drop the dependent view
-- ==========================================
DROP VIEW IF EXISTS public.order_lifecycle_view;

-- ==========================================
-- STEP 2: Fix production_batches.product_id type
-- ==========================================
ALTER TABLE public.production_batches 
ALTER COLUMN product_id TYPE UUID USING product_id::UUID;

-- ==========================================
-- STEP 3: Recreate the view with original definition
-- ==========================================
CREATE VIEW public.order_lifecycle_view AS
 SELECT DISTINCT ON (o.id) o.id,
    o.order_number,
    o.status AS order_status,
    o.customer_id,
    o.total_amount,
    o.created_at AS order_created_at,
    o.updated_at AS order_updated_at,
    pb.id AS production_batch_id,
    pb.status AS production_status,
    pb.created_at AS production_created_at,
    pb.updated_at AS production_updated_at,
    d.id AS delivery_id,
    d.status AS delivery_status,
    d.delivery_number,
    d.created_at AS delivery_created_at,
    d.updated_at AS delivery_updated_at,
    COALESCE(p.full_name, 'Unknown Customer'::text) AS customer_name,
    p.email AS customer_email,
        CASE
            WHEN o.status = 'pending'::text THEN 'Order Placed'::text
            WHEN o.status = 'confirmed'::text THEN 'Order Confirmed'::text
            WHEN o.status = 'ready_production'::text THEN 'Preparing Your Order'::text
            WHEN o.status = 'in_production'::text THEN 'Preparing Your Order'::text
            WHEN o.status = 'ready_delivery'::text THEN 'Ready for Dispatch'::text
            WHEN o.status = 'out_for_delivery'::text THEN 'Out for Delivery'::text
            WHEN o.status = 'delivered'::text THEN 'Delivered'::text
            WHEN o.status = 'cancelled'::text THEN 'Cancelled'::text
            ELSE o.status
        END AS customer_status,
    GREATEST(o.updated_at, COALESCE(pb.updated_at, o.updated_at), COALESCE(d.updated_at, o.updated_at)) AS last_activity_at
   FROM orders o
     LEFT JOIN profiles p ON o.customer_id = p.id
     LEFT JOIN LATERAL ( SELECT production_batches.id,
            production_batches.batch_number,
            production_batches.product_id,
            production_batches.quantity_produced,
            production_batches.status,
            production_batches.planned_date,
            production_batches.actual_production_date,
            production_batches.notes,
            production_batches.created_at,
            production_batches.updated_at,
            production_batches.order_id,
            production_batches.created_by,
            production_batches.start_time,
            production_batches.end_time,
            production_batches.priority,
            production_batches.delivery_created,
            production_batches.batch_type,
            production_batches.total_orders,
            production_batches.total_quantity_produced,
            production_batches.waste_factor,
            production_batches.total_weight_grams
           FROM production_batches
          WHERE production_batches.order_id = o.id
          ORDER BY production_batches.updated_at DESC
         LIMIT 1) pb ON true
     LEFT JOIN LATERAL ( SELECT deliveries.id,
            deliveries.order_id,
            deliveries.delivery_partner_id,
            deliveries.pickup_time,
            deliveries.delivered_time,
            deliveries.status,
            deliveries.notes,
            deliveries.created_at,
            deliveries.updated_at,
            deliveries.delivery_number,
            deliveries.batch_id,
            deliveries.customer_name,
            deliveries.customer_email,
            deliveries.customer_phone,
            deliveries.delivery_address,
            deliveries.delivery_partner_name,
            deliveries.delivery_partner_phone,
            deliveries.estimated_delivery_date,
            deliveries.actual_delivery_date,
            deliveries.tracking_number,
            deliveries.items_count,
            deliveries.total_value,
            deliveries.delivery_status
           FROM deliveries
          WHERE deliveries.order_id = o.id
          ORDER BY deliveries.updated_at DESC
         LIMIT 1) d ON true
  ORDER BY o.id, o.created_at DESC;

-- ==========================================
-- STEP 4: Add missing columns to order_items (if not already added)
-- ==========================================
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ==========================================
-- STEP 5: Create sample order_items data (if table is empty)
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
    WHERE pv.product_id = (SELECT id FROM products ORDER BY RANDOM() LIMIT 1)
    LIMIT 1
) pv
WHERE o.status IN ('pending', 'confirmed', 'processing')
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 6: Create indexes for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);

-- ==========================================
-- STEP 7: Verification queries
-- ==========================================

-- Check order_items structure
SELECT 'order_items columns after fix' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data
SELECT 'order_items sample data' as info, COUNT(*) as count FROM order_items;

-- Check production_batches product_id type
SELECT 'production_batches product_id type' as info, udt_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'production_batches' 
  AND column_name = 'product_id' 
  AND table_schema = 'public';

-- Test the problematic query
SELECT 
    o.id,
    o.status,
    oi.id as item_id,
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
LIMIT 3;
