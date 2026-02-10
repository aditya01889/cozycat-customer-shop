-- MANUAL SCHEMA FIX FOR STAGING DATABASE
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- ==========================================
-- FIX 1: Add missing columns to order_items
-- ==========================================

-- Add unit_price column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);

-- Add total_price column  
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

-- Add created_at column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add product_variant_id for relationship
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

-- ==========================================
-- FIX 2: Update existing records
-- ==========================================

-- Set default values for any existing records
UPDATE order_items 
SET 
    unit_price = COALESCE(unit_price, 0.00),
    total_price = COALESCE(total_price, 0.00),
    created_at = COALESCE(created_at, NOW()),
    updated_at = NOW()
WHERE unit_price IS NULL OR total_price IS NULL OR created_at IS NULL;

-- ==========================================
-- FIX 3: Add sample data for testing
-- ==========================================

-- Insert sample order_items so the frontend doesn't break
INSERT INTO order_items (id, order_id, product_variant_id, quantity, unit_price, total_price, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    o.id as order_id,
    pv.id as product_variant_id,
    1 as quantity,
    29.99 as unit_price,
    29.99 as total_price,
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
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- FIX 4: Create indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);

-- ==========================================
-- FIX 5: Fix production_batches relationships
-- ==========================================

-- Ensure product_id column exists and is properly typed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'production_batches' 
        AND column_name = 'product_id'
        AND table_schema = 'public'
    ) THEN
        -- Column exists, ensure it's UUID type
        ALTER TABLE production_batches 
        ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
    ELSE
        -- Add the column
        ALTER TABLE production_batches 
        ADD COLUMN product_id UUID REFERENCES products(id);
    END IF;
END $$;

-- Create index for production_batches
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check order_items structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data
SELECT COUNT(*) as order_items_count FROM order_items;

-- Check production_batches
SELECT COUNT(*) as batches_with_product_id 
FROM production_batches 
WHERE product_id IS NOT NULL;
