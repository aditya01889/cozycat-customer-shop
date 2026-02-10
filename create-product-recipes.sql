-- =====================================================
-- CREATE MISSING product_recipes TABLE IN STAGING
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Create product_recipes table (exact production schema)
CREATE TABLE IF NOT EXISTS public.product_recipes (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    product_id UUID NOT NULL,
    ingredient_id UUID NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON public.product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_ingredient_id ON public.product_recipes(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_percentage ON public.product_recipes(percentage);

-- Add foreign key constraints if needed
ALTER TABLE public.product_recipes 
ADD CONSTRAINT fk_product_recipes_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_recipes 
ADD CONSTRAINT fk_product_recipes_ingredient_id 
FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;

-- Verify table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'product_recipes'
ORDER BY table_name;
