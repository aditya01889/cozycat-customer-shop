-- SQL to create missing tables in staging database
-- Run this first, then execute the INSERT statements

-- Create product_ingredients table (was called "product_recipes" in production)
CREATE TABLE IF NOT EXISTS product_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    percentage DECIMAL(5,2) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient_id ON product_ingredients(ingredient_id);

-- Note: order_items, packaging, labels tables don't exist in production
-- So no need to create them

-- Verify table creation
SELECT 
    'product_ingredients' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_ingredients'
ORDER BY ordinal_position;
