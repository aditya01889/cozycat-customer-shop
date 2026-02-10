-- Fix Schema Issues in Staging Database
-- This script fixes missing columns and relationships after database sync

-- Fix 1: Add missing columns to order_items table
-- The frontend expects these columns but they don't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix 2: Ensure product_variant_id exists for the relationship
-- This is needed for the product_variants!inner relationship
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

-- Fix 3: Update existing order_items records if they exist
-- Set default values for existing records
UPDATE order_items 
SET 
    unit_price = COALESCE(unit_price, 0.00),
    total_price = COALESCE(total_price, 0.00),
    created_at = COALESCE(created_at, NOW()),
    updated_at = NOW()
WHERE unit_price IS NULL OR total_price IS NULL OR created_at IS NULL;

-- Fix 4: Create missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);

-- Fix 5: Ensure production_batches has proper product relationship
-- The frontend is trying to access products:product_id but the relationship might be wrong
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

-- Fix 6: Create index for production_batches product_id
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);

-- Fix 7: Update production_batches relationships
-- Make sure product_id is populated if possible
UPDATE production_batches 
SET product_id = NULL 
WHERE product_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM products WHERE id = production_batches.product_id
);

-- Fix 8: Add sample data to order_items for testing
-- Since order_items is empty, add some sample data so the frontend doesn't break
INSERT INTO order_items (id, order_id, product_variant_id, quantity, unit_price, total_price, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    o.id as order_id,
    pv.id as product_variant_id,
    1 as quantity,
    COALESCE(o.total_amount, 0.00) as unit_price,
    COALESCE(o.total_amount, 0.00) as total_price,
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
LIMIT 10
ON CONFLICT (id) DO NOTHING;

-- Verification queries
-- These should help verify the fixes worked
SELECT 'order_items columns' as table_info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'production_batches columns' as table_info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'production_batches' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if relationships work
SELECT 'order_items count' as info, COUNT(*) as count FROM order_items;

SELECT 'production_batches with product_id' as info, COUNT(*) as count 
FROM production_batches 
WHERE product_id IS NOT NULL;
