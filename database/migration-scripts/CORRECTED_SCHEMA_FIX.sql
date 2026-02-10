-- CORRECTED SCHEMA FIX FOR STAGING DATABASE
-- Execute this SQL in Supabase Dashboard > SQL Editor on STAGING database
-- This fixes the actual issues found during testing

-- ==========================================
-- STEP 1: Add missing columns to order_items
-- ==========================================

-- The table is missing product_variant_id which is causing all errors
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

-- Add other missing columns
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ==========================================
-- STEP 2: Create sample data (using correct column names)
-- ==========================================

-- Insert sample order_items so operations page doesn't break
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
-- STEP 3: Create indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);

-- ==========================================
-- STEP 4: Fix production_batches relationship
-- ==========================================

-- The frontend is trying to access products:product_id but relationship might be wrong
-- Check if product_id column exists and is properly typed
DO $$
BEGIN
    -- Check if product_id column exists in production_batches
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'production_batches' 
        AND column_name = 'product_id'
        AND table_schema = 'public'
    ) THEN
        -- Column exists, make sure it's the right type for relationship
        ALTER TABLE production_batches 
        ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
    ELSE
        -- Column doesn't exist, add it
        ALTER TABLE production_batches 
        ADD COLUMN product_id UUID REFERENCES products(id);
    END IF;
END $$;

-- Create index for production_batches
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);

-- ==========================================
-- STEP 5: Verification queries
-- ==========================================

-- Check order_items structure
SELECT 'order_items columns after fix' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data
SELECT 'order_items sample data' as info, COUNT(*) as count FROM order_items;

-- Check production_batches
SELECT 'production_batches with product_id' as info, COUNT(*) as count 
FROM production_batches 
WHERE product_id IS NOT NULL;

-- Test the problematic query that was failing
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
