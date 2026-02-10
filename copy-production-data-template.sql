-- =====================================================
-- COPY PRODUCTION DATA TO STAGING TEMPLATE
-- Instructions:
-- 1. Export data from production tables
-- 2. Replace the TODO sections below with actual production data
-- 3. Run this SQL in staging
-- =====================================================

-- Step 1: Clear existing sample data (keep table structure)
DELETE FROM public.ingredients WHERE id NOT LIKE '00000000%';
DELETE FROM public.product_recipes WHERE id NOT LIKE '00000000%';
DELETE FROM public.products WHERE id NOT LIKE '00000000%';
DELETE FROM public.product_variants WHERE id NOT LIKE '00000000%';
DELETE FROM public.order_items WHERE id NOT LIKE '00000000%';
DELETE FROM public.production_batches WHERE id NOT LIKE '00000000%';
DELETE FROM public.deliveries WHERE id NOT LIKE '00000000%';
DELETE FROM public.delivery_partners WHERE id NOT LIKE '00000000%';
DELETE FROM public.orders WHERE id NOT LIKE '00000000%';

-- Step 2: Insert production ingredients data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.ingredients (id, name, unit, current_stock, reorder_level, unit_cost, created_at, updated_at, supplier) VALUES
-- Example:
INSERT INTO public.ingredients (id, name, unit, current_stock, reorder_level, unit_cost, created_at, updated_at, supplier) VALUES
('actual-uuid-1', 'Actual Ingredient 1', 'kg', 100.000, 20.000, 2.50, '2024-01-01 00:00:00', '2024-01-01 00:00:00', NULL),
('actual-uuid-2', 'Actual Ingredient 2', 'liters', 50.000, 10.000, 3.00, '2024-01-01 00:00:00', '2024-01-01 00:00:00', NULL);

-- Step 3: Insert production products data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.products (id, category_id, name, slug, description, short_description, nutritional_info, ingredients_display, image_url, is_active, display_order, created_at, updated_at, packaging_type, label_type, packaging_quantity_per_product, label_quantity_per_product) VALUES
-- Example:
INSERT INTO public.products (id, category_id, name, slug, description, short_description, nutritional_info, ingredients_display, image_url, is_active, display_order, created_at, updated_at, packaging_type, label_type, packaging_quantity_per_product, label_quantity_per_product) VALUES
('actual-uuid-1', NULL, 'Actual Product 1', 'actual-product-1', 'Actual product description', 'Short description', '{"calories": 250, "protein": 10}', 'Ingredients display', 'https://example.com/image1.jpg', true, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'box', 'sticker', 1, 1, 1),
('actual-uuid-2', NULL, 'Actual Product 2', 'actual-product-2', 'Actual product description', 'Short description', '{"calories": 300, "protein": 15}', 'Ingredients display', 'https://example.com/image2.jpg', true, 2, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'box', 'sticker', 1, 1, 1);

-- Step 4: Insert production product_variants data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.product_variants (id, product_id, weight_grams, price, sku, is_active, created_at) VALUES
-- Example:
INSERT INTO public.product_variants (id, product_id, weight_grams, price, sku, is_active, created_at) VALUES
('actual-uuid-1', 'actual-uuid-1', 500, 299.99, 'PROD1-500G', true, '2024-01-01 00:00:00'),
('actual-uuid-2', 'actual-uuid-1', 1000, 499.99, 'PROD1-1KG', true, '2024-01-01 00:00:00');

-- Step 5: Insert production product_recipes data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.product_recipes (id, product_id, ingredient_id, percentage, created_at) VALUES
-- Example:
INSERT INTO public.product_recipes (id, product_id, ingredient_id, percentage, created_at) VALUES
('actual-uuid-1', 'actual-uuid-1', 'actual-uuid-1', 45.00, '2024-01-01 00:00:00'),
('actual-uuid-2', 'actual-uuid-1', 'actual-uuid-2', 30.00, '2024-01-01 00:00:00'),
('actual-uuid-3', 'actual-uuid-1', 'actual-uuid-3', 15.00, '2024-01-01 00:00:00'),
('actual-uuid-4', 'actual-uuid-1', 'actual-uuid-4', 10.00, '2024-01-01 00:00:00');

-- Step 6: Insert production orders data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.orders (id, order_number, customer_id, status, payment_method, payment_status, subtotal, delivery_fee, total_amount, delivery_address_id, delivery_notes, order_date, confirmed_date, production_start_date, ready_date) VALUES
-- Example:
INSERT INTO public.orders (id, order_number, customer_id, status, payment_method, payment_status, subtotal, delivery_fee, total_amount, delivery_address_id, delivery_notes, order_date, confirmed_date, production_start_date, ready_date) VALUES
('actual-uuid-1', 'ORDER-001', 'actual-customer-uuid', 'delivered', 'cod', 'paid', 299.99, 10.00, 309.99, NULL, 'Deliver to main entrance', '2024-01-01 00:00:00', '2024-01-01 01:00:00', '2024-01-01 02:00:00', '2024-01-01 10:00:00', '2024-01-01 15:00:00'),
('actual-uuid-2', 'ORDER-002', 'actual-customer-uuid', 'confirmed', 'online', 'paid', 499.99, 15.00, 514.99, NULL, 'Leave at door', '2024-01-02 00:00:00', '2024-01-02 01:30:00', NULL, NULL, NULL);

-- Step 7: Insert production order_items data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.order_items (id, order_id, product_variant_id, quantity, unit_price, total_price, created_at) VALUES
-- Example:
INSERT INTO public.order_items (id, order_id, product_variant_id, quantity, unit_price, total_price, created_at) VALUES
('actual-uuid-1', 'actual-uuid-1', 'actual-uuid-1', 1, 299.99, 299.99, '2024-01-01 00:00:00'),
('actual-uuid-2', 'actual-uuid-2', 'actual-uuid-2', 1, 499.99, 499.99, '2024-01-02 00:00:00');

-- Step 8: Insert production production_batches data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.production_batches (id, batch_number, product_id, quantity_produced, status, planned_date, actual_production_date, notes, created_at, updated_at, order_id, created_by, start_time, end_time, priority, delivery_created, batch_type, total_orders, total_quantity_produced, waste_factor, total_weight_grams) VALUES
-- Example:
INSERT INTO public.production_batches (id, batch_number, product_id, quantity_produced, status, planned_date, actual_production_date, notes, created_at, updated_at, order_id, created_by, start_time, end_time, priority, delivery_created, batch_type, total_orders, total_quantity_produced, waste_factor, total_weight_grams) VALUES
('actual-uuid-1', 'BATCH-001', 'actual-uuid-1', 100, 'completed', '2024-01-01', '2024-01-01', 'Production batch', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'actual-uuid-1', 'actual-user-uuid', '2024-01-01 08:00:00', '2024-01-01 16:00:00', 1, true, 'single', 1, 100, 7.5, 50000),
('actual-uuid-2', 'BATCH-002', 'actual-uuid-2', 50, 'in_progress', '2024-01-02', NULL, 'In progress batch', '2024-01-02 00:00:00', '2024-01-02 00:00:00', 'actual-uuid-2', 'actual-user-uuid', '2024-01-02 08:00:00', NULL, NULL, 2, false, 'single', 1, 50, 7.5, 25000);

-- Step 9: Insert production deliveries data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.deliveries (id, delivery_number, order_id, batch_id, delivery_partner_id, status, pickup_time, delivered_time, estimated_delivery_date, actual_delivery_date, tracking_number, customer_name, customer_email, customer_phone, delivery_address, delivery_partner_name, delivery_partner_phone, items_count, total_value, delivery_status, notes, created_at, updated_at) VALUES
-- Example:
INSERT INTO public.deliveries (id, delivery_number, order_id, batch_id, delivery_partner_id, status, pickup_time, delivered_time, estimated_delivery_date, actual_delivery_date, tracking_number, customer_name, customer_email, customer_phone, delivery_address, delivery_partner_name, delivery_partner_phone, items_count, total_value, delivery_status, notes, created_at, updated_at) VALUES
('actual-uuid-1', 'DEL-001', 'actual-uuid-1', 'actual-uuid-1', 'actual-partner-uuid', 'delivered', '2024-01-01 10:00:00', '2024-01-01 18:00:00', '2024-01-01 17:00:00', '2024-01-01 18:00:00', 'TRACK123', 'John Doe', 'john@example.com', '+1234567890', '123 Main St', 'Delivery Partner Inc', '+9876543210', 1, 309.99, 'delivered', 'Delivered successfully', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- Step 10: Insert production delivery_partners data
-- TODO: Replace with actual production data
-- Format: INSERT INTO public.delivery_partners (id, name, contact_phone, is_active, created_at) VALUES
-- Example:
INSERT INTO public.delivery_partners (id, name, contact_phone, is_active, created_at) VALUES
('actual-uuid-1', 'Delivery Partner Inc', '+9876543210', true, '2024-01-01 00:00:00'),
('actual-uuid-2', 'Quick Delivery', '+1234567890', true, '2024-01-01 00:00:00');

-- Step 11: Verify data insertion
SELECT 
    'ingredients' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN id LIKE 'actual-uuid%' THEN 1 END) as production_records
FROM public.ingredients
UNION ALL
SELECT 
    'product_recipes' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN id LIKE 'actual-uuid%' THEN 1 END) as production_records
FROM public.product_recipes
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN id LIKE 'actual-uuid%' THEN 1 END) as production_records
FROM public.products
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN id LIKE 'actual-uuid%' THEN 1 END) as production_records
FROM public.orders
ORDER BY table_name;
