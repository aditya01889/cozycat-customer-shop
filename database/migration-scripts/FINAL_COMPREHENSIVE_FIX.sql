-- FINAL COMPREHENSIVE FIX FOR ALL OPERATIONS PAGE ISSUES
-- Execute this SQL in Supabase Dashboard > SQL Editor on STAGING database
-- This fixes all remaining schema and relationship issues

-- ==========================================
-- STEP 1: Fix production_batches relationship issue
-- ==========================================
-- The error suggests no foreign key relationship exists between production_batches and products
-- Let's create the proper foreign key relationship

-- First, check if product_id column exists and has proper data
DO $$
BEGIN
    -- Check if product_id column exists and has data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'production_batches' 
        AND column_name = 'product_id'
        AND table_schema = 'public'
    ) THEN
        -- Update any NULL or invalid product_id values
        UPDATE production_batches 
        SET product_id = NULL 
        WHERE product_id IS NOT NULL 
        AND NOT EXISTS (
            SELECT 1 FROM products WHERE id = production_batches.product_id
        );
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'production_batches' 
        AND constraint_name = 'production_batches_product_id_fkey'
        AND table_schema = 'public'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE production_batches 
        ADD CONSTRAINT production_batches_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==========================================
-- STEP 2: Add sample data to empty tables
-- ==========================================

-- Add sample production_batches with valid product relationships
INSERT INTO production_batches (id, batch_number, product_id, quantity_produced, status, planned_date, actual_production_date, notes, created_at, updated_at, order_id, start_time, end_time, priority, delivery_created, batch_type, total_orders, total_quantity_produced, waste_factor, total_weight_grams)
SELECT 
    gen_random_uuid() as id,
    'BATCH-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24-MI') as batch_number,
    p.id as product_id,
    100 as quantity_produced,
    'completed' as status,
    NOW() as planned_date,
    NOW() as actual_production_date,
    'Sample batch for testing' as notes,
    NOW() as created_at,
    NOW() as updated_at,
    o.id as order_id,
    NULL as start_time,  -- Make this nullable instead of 'system'
    NOW() as end_time,
    1 as priority,
    false as delivery_created,
    'production' as batch_type,
    1 as total_orders,
    100 as total_quantity_produced,
    0.05 as waste_factor,
    500.5 as total_weight_grams
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM products p ORDER BY RANDOM() LIMIT 1
) p
WHERE o.status IN ('pending', 'confirmed', 'processing')
LIMIT 3
ON CONFLICT (id) DO NOTHING;

-- Add sample deliveries
INSERT INTO deliveries (id, order_id, delivery_partner_id, pickup_time, delivered_time, status, notes, created_at, updated_at, delivery_number, batch_id, customer_name, customer_email, customer_phone, delivery_address, delivery_partner_name, delivery_partner_phone, estimated_delivery_date, actual_delivery_date, tracking_number, items_count, total_value, delivery_status)
SELECT 
    gen_random_uuid() as id,
    o.id as order_id,
    dp.id as delivery_partner_id,
    NOW() as pickup_time,
    NOW() + INTERVAL '1 day' as delivered_time,
    'delivered' as status,
    'Sample delivery for testing' as notes,
    NOW() as created_at,
    NOW() as updated_at,
    'DEL-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24-MI') as delivery_number,
    pb.id as batch_id,
    p.full_name as customer_name,
    p.email as customer_email,
    '1234567890' as customer_phone,
    '123 Test Street, Test City' as delivery_address,
    dp.company_name as delivery_partner_name,
    dp.phone as delivery_partner_phone,
    NOW() as estimated_delivery_date,
    NOW() + INTERVAL '1 day' as actual_delivery_date,
    'TRACK123' as tracking_number,
    1 as items_count,
    o.total_amount as total_value,
    'completed' as delivery_status
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM products p ORDER BY RANDOM() LIMIT 1
) p
CROSS JOIN LATERAL (
    SELECT id FROM production_batches pb ORDER BY created_at DESC LIMIT 1
) pb
CROSS JOIN LATERAL (
    SELECT id, company_name, phone FROM delivery_partners dp ORDER BY RANDOM() LIMIT 1
) dp
WHERE o.status IN ('pending', 'confirmed', 'processing')
LIMIT 3
ON CONFLICT (id) DO NOTHING;

-- Add sample vendors (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'vendors' 
        AND table_schema = 'public'
    ) THEN
        INSERT INTO vendors (id, name, email, phone, address, contact_person, created_at, updated_at)
        SELECT 
            gen_random_uuid() as id,
            'Test Vendor ' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24-MI') as name,
            'vendor' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '@test.com' as email,
            '123-456-7890' as phone,
            '123 Vendor Street, Vendor City' as address,
            'Test Contact' as contact_person,
            NOW() as created_at,
            NOW() as updated_at
        LIMIT 1
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Add sample inventory (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'inventory' 
        AND table_schema = 'public'
    ) THEN
        INSERT INTO inventory (id, product_id, variant_id, quantity, location, created_at, updated_at)
        SELECT 
            gen_random_uuid() as id,
            p.id as product_id,
            pv.id as variant_id,
            FLOOR(RANDOM() * 100 + 50)::int as quantity,
            'Main Storage' as location,
            NOW() as created_at,
            NOW() as updated_at
        FROM products p
        CROSS JOIN LATERAL (
            SELECT id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY RANDOM() LIMIT 1
        ) pv
        LIMIT 10
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- ==========================================
-- STEP 3: Verification queries
-- ==========================================

-- Test the problematic production_batches query
SELECT 'Testing production_batches relationship' as test_type,
       pb.id,
       pb.batch_number,
       pb.product_id,
       p.name as product_name,
       pb.status,
       pb.quantity_produced
FROM production_batches pb
LEFT JOIN products p ON pb.product_id = p.id
ORDER BY pb.created_at DESC
LIMIT 5;

-- Test deliveries query
SELECT 'Testing deliveries data' as test_type,
       COUNT(*) as delivery_count
FROM deliveries;

-- Test vendors query (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'vendors' 
        AND table_schema = 'public'
    ) THEN
        SELECT 'Testing vendors data' as test_type,
               COUNT(*) as vendor_count
        FROM vendors;
    END IF;
END $$;

-- Test inventory query (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'inventory' 
        AND table_schema = 'public'
    ) THEN
        SELECT 'Testing inventory data' as test_type,
               COUNT(*) as inventory_count
        FROM inventory;
    END IF;
END $$;

-- Check order_items with full relationships
SELECT 'Testing order_items with relationships' as test_type,
       oi.id,
       oi.order_id,
       oi.product_variant_id,
       oi.quantity,
       oi.price,
       oi.total_price,
       pv.id as variant_id,
       p.name as product_name,
       oi.created_at
FROM order_items oi
LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
LEFT JOIN products p ON pv.product_id = p.id
ORDER BY oi.created_at DESC
LIMIT 5;
