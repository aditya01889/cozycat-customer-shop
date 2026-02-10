-- =====================================================
-- CREATE MISSING TABLES WITH SAMPLE DATA IN STAGING
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Step 1: Create order_items table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "product_variant_id" "uuid",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Step 2: Create product_variants table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "weight_grams" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "sku" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Step 3: Insert sample products (needed for recipes)
INSERT INTO public.products (id, name, slug, description, is_active, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Sample Product 1', 'sample-product-1', 'Sample product for testing', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'Sample Product 2', 'sample-product-2', 'Sample product for testing', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert sample product variants
INSERT INTO public.product_variants (id, product_id, weight_grams, price, sku, is_active, created_at) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 500, 299.99, 'PROD1-500G', true, NOW()),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 1000, 499.99, 'PROD1-1KG', true, NOW()),
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 250, 199.99, 'PROD2-250G', true, NOW()),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 750, 349.99, 'PROD2-750G', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 5: Insert sample ingredients
INSERT INTO public.ingredients (id, name, unit, current_stock, reorder_level, unit_cost, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Flour', 'kg', 100.000, 20.000, 2.50, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'Sugar', 'kg', 50.000, 10.000, 3.00, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'Butter', 'kg', 30.000, 5.000, 8.00, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', 'Eggs', 'dozen', 10.000, 2.000, 15.00, NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', 'Milk', 'liters', 25.000, 5.000, 4.50, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 6: Insert sample product recipes
INSERT INTO public.product_recipes (id, product_id, ingredient_id, percentage, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 45.00, NOW()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 30.00, NOW()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 15.00, NOW()),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 10.00, NOW()),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 5.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 7: Insert sample production batches
INSERT INTO public.production_batches (id, batch_number, product_id, quantity_produced, status, planned_date, actual_production_date, notes, created_at, updated_at, order_id, created_by, start_time, end_time, priority, delivery_created, batch_type, total_orders, total_quantity_produced, waste_factor, total_weight_grams) VALUES
('00000000-0000-0000-0000-000000000001', 'BATCH-001', '00000000-0000-0000-0000-000000000001', 100, 'completed', CURRENT_DATE, CURRENT_DATE, 'Sample batch', NOW(), NOW(), NULL, NULL, NULL, NULL, 1, true, 'single', 1, 100, 7.5, 50000),
('00000000-0000-0000-0000-000000000002', 'BATCH-002', '00000000-0000-0000-0000-000000000002', 50, 'in_progress', CURRENT_DATE, NULL, 'In progress batch', NOW(), NOW(), NULL, NULL, NULL, 2, false, 'single', 1, 50, 7.5, 25000)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Insert sample orders
INSERT INTO public.orders (id, order_number, customer_id, status, payment_method, payment_status, subtotal, delivery_fee, total_amount, order_date) VALUES
('00000000-0000-0000-0000-000000000001', 'ORDER-001', 'cb5ecb9b-dbd2-4588-8158-566460048292', 'pending', 'cod', 'pending', 299.99, 10.00, 309.99, NOW()),
('00000000-0000-0000-0000-000000000002', 'ORDER-002', 'cb5ecb9b-dbd2-4588-8158-566460048292', 'confirmed', 'online', 'paid', 499.99, 15.00, 514.99, NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 9: Insert sample order items
INSERT INTO public.order_items (id, order_id, product_variant_id, quantity, unit_price, total_price, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 1, 299.99, 299.99, NOW()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 1, 499.99, 499.99, NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON public.order_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON public.product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_ingredient_id ON public.product_recipes(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_order_id ON public.production_batches(order_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Step 11: Verify all tables were created and have data
SELECT 
    'ingredients' as table_name,
    COUNT(*) as record_count
FROM public.ingredients
UNION ALL
SELECT 
    'product_recipes' as table_name,
    COUNT(*) as record_count
FROM public.product_recipes
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as record_count
FROM public.products
UNION ALL
SELECT 
    'product_variants' as table_name,
    COUNT(*) as record_count
FROM public.product_variants
UNION ALL
SELECT 
    'order_items' as table_name,
    COUNT(*) as record_count
FROM public.order_items
UNION ALL
SELECT 
    'production_batches' as table_name,
    COUNT(*) as record_count
FROM public.production_batches
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as record_count
FROM public.orders
ORDER BY table_name;
