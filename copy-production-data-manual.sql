-- =====================================================
-- COPY PRODUCTION DATA TO STAGING (MANUAL SQL)
-- Based on production data discovered:
-- - 40 ingredients records
-- - 94 product_recipes records  
-- - 18 products records
-- - 22 product_variants records
-- - 0 order_items records
-- - 23 production_batches records
-- - 18 deliveries records
-- - 4 delivery_partners records
-- - 76 orders records
-- =====================================================

-- Step 1: Clear existing sample data
DELETE FROM public.ingredients WHERE id LIKE '00000000%';
DELETE FROM public.product_recipes WHERE id LIKE '00000000%';
DELETE FROM public.products WHERE id LIKE '00000000%';
DELETE FROM public.product_variants WHERE id LIKE '00000000%';
DELETE FROM public.production_batches WHERE id LIKE '00000000%';
DELETE FROM public.deliveries WHERE id LIKE '00000000%';
DELETE FROM public.delivery_partners WHERE id LIKE '00000000%';
DELETE FROM public.orders WHERE id LIKE '00000000%';

-- Step 2: Insert production ingredients data (40 records found)
INSERT INTO public.ingredients (id, name, unit, current_stock, reorder_level, unit_cost, created_at, updated_at, supplier) VALUES
('00e488e4-1db8-477e-b3d5-cc08473ab342', 'CCK Logo', 'pieces', 20.000, 20.000, 1.00, '2026-01-27 13:17:06.022182+00', '2026-01-27 13:17:06.022182+00', NULL),
('013e571f-a016-4ea6-bbb8-fcf1396c2b72', 'Ice gel pack 150g', 'pieces', 50.000, 10.000, 5.00, '2026-01-27 13:23:50.073749+00', '2026-01-27 13:23:50.073749+00', NULL),
('02b3165a-3468-4250-b54c-4d287c34de65', 'Cookie Jar', 'pieces', 10.000, 10.000, 10.00, '2026-01-27 13:17:03.348072+00', '2026-01-27 13:17:03.348072+00', NULL),
('0659df84-38c0-46d0-8f99-74f8312b56ff', '70g SUP', 'pieces', 250.000, 250.000, 3.25, '2026-01-27 13:17:02.716745+00', '2026-01-27 13:17:02.716745+00', NULL),
('090f32a0-3447-4292-838f-f91e6d7a1636', 'Nurture Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:05.10646+00', '2026-01-27 13:17:05.10646+00', NULL),
('0b19bfb3-3e32-4a91-b939-4f1ff698aacb', 'Seasonal Veggies', 'g', 250.000, 250.000, 1.00, '2026-01-27 13:17:02.518109+00', '2026-01-27 13:17:02.518109+00', NULL),
('0f19bc57-2a8a-4dee-9c0c-6382817b24da', '100ml Spout Pouch', 'pieces', 50.000, 50.000, 4.00, '2026-01-27 13:17:02.949131+00', '2026-01-27 13:17:02.949131+00', NULL),
('108e088d-9bb2-44d2-9c99-0e0ddfec38ab', 'Oats', 'g', 500.000, 500.000, 1.00, '2026-01-27 13:16:58.08729+00', '2026-01-27 13:16:58.08729+00', NULL),
('1d8b024e-d27a-44e7-842c-5c7dc8b9821e', 'Rice Flour', 'g', 500.000, 500.000, 1.00, '2026-01-27 13:17:01.299777+00', '2026-01-27 13:17:01.299777+00', NULL),
('22122e91-3891-4b01-b8be-cdd8f5fb5c07', 'Thermocol Box', 'pieces', 8.000, 8.000, 1.00, '2026-01-27 13:17:03.755608+00', '2026-01-27 13:17:03.755608+00', NULL),
('2582b45a-a9ae-425c-9fd2-185a6dcba681', 'Eggs', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:16:57.830321+00', '2026-01-27 13:16:57.830321+00', NULL),
('26f0036c-04cf-4f5f-8bdd-cc18e9aa08a3', 'Flaxseeds', 'g', 50.000, 50.000, 1.00, '2026-01-27 13:16:58.345443+00', '2026-01-27 13:16:58.345443+00', NULL),
('2a7104b9-3253-4ee9-827a-6c86e7d1433d', 'Power Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:04.682961+00', '2026-01-27 13:17:04.682961+00', NULL),
('3d06baf4-8acd-4707-9f61-4b8eebfe74ae', 'Carrots', 'g', 250.000, 250.000, 1.00, '2026-01-27 13:17:02.108185+00', '2026-01-27 13:17:02.108185+00', NULL),
('4a4d050a-63db-4a7f-9da1-05f93957976a', 'Water', 'ltr', 99999999.000, 99999999.000, 1.00, '2026-01-27 13:17:00.891403+00', '2026-01-27 13:17:00.891403+00', NULL),
('4f6cfad7-5410-4dc9-8774-6ff7be882eef', 'Basa', 'g', 0.000, 0.000, 1.00, '2026-01-27 13:17:00.069957+00', '2026-01-27 13:17:00.069957+00', NULL),
('507385dc-a6e6-4e85-8350-d9f488abf33e', 'Coconut Oil', 'ml', 250.000, 250.000, 1.00, '2026-01-27 13:17:00.488865+00', '2026-01-27 13:17:00.488865+00', NULL),
('50e214f9-3d35-47ad-b013-a064ec3121f1', 'Bone Broth', 'ml', 1000.000, 1000.000, 1.00, '2026-01-27 13:17:00.288092+00', '2026-01-27 13:17:00.288092+00', NULL),
('5519b3d3-b4f2-4deb-bde9-3c4a1c19a8e9', 'Vitality Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:04.379787+00', '2026-01-27 13:17:04.379787+00', NULL),
('58f0837c-1306-456f-b797-2c4fb9b8fb59', 'Rice', 'g', 1000.000, 1000.000, 1.00, '2026-01-27 13:16:57.61786+00', '2026-01-27 13:16:57.61786+00', NULL),
('82ffad73-32c0-44da-a8a5-c5d0bfea8a33', 'Salmon Fish Oil', 'ml', 100.000, 100.000, 1.00, '2026-01-27 13:16:58.653512+00', '2026-01-27 13:16:58.653512+00', NULL),
('8e0efb82-7f60-4272-8705-c915a07c24d0', 'Bone Rich Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:05.508328+00', '2026-01-27 13:17:05.508328+00', NULL),
('90b41140-164a-4ccf-bee2-6968d5b7ccb7', 'Nourish Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:04.173716+00', '2026-01-27 13:17:04.173716+00', NULL),
('97a202a6-acfc-40a7-b203-2db8e7375464', 'Banana', 'g', 0.000, 0.000, 1.00, '2026-01-27 13:17:01.54647+00', '2026-01-27 13:17:01.54647+00', NULL),
('9ceb2fd4-8ec1-420d-a4bf-2696851fd2eb', 'Supreme Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:04.896378+00', '2026-01-27 13:17:04.896378+00', NULL),
('a9f9c759-e463-44dd-81b1-c58f559385d1', 'Hearts', 'g', 200.000, 200.000, 1.00, '2026-01-27 13:16:59.362027+00', '2026-01-27 13:16:59.362027+00', NULL),
('ae2254d8-0da8-4eb1-b887-2018f6ca1dbb', 'Eggshell Powder', 'g', 500.000, 500.000, 1.00, '2026-01-27 13:16:58.946919+00', '2026-01-27 13:16:58.946919+00', NULL),
('b31f2fcc-bf7c-4ea1-9307-912cc13c9330', 'Seaweed Topper', 'g', 40.000, 40.000, 1.00, '2026-01-27 13:16:59.569477+00', '2026-01-27 13:16:59.569477+00', NULL),
('bc517351-5de5-4916-a770-088ef90a0c9a', 'Beetroot', 'g', 250.000, 250.000, 1.00, '2026-01-27 13:17:01.779696+00', '2026-01-27 13:17:01.779696+00', NULL),
('bd6bdf89-d073-4d33-815f-aa71046ca4de', 'Liver', 'g', 500.000, 500.000, 1.00, '2026-01-27 13:16:59.145104+00', '2026-01-27 13:16:59.145104+00', NULL),
('c0f69793-b6bb-4498-bfd1-9051c965fbe6', 'Tuna', 'g', 0.000, 0.000, 1.00, '2026-01-27 13:16:59.775472+00', '2026-01-27 13:16:59.775472+00', NULL),
('ca320781-2260-43c2-b0cb-f861a1753697', 'Essence Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:05.805506+00', '2026-01-27 13:17:05.805506+00', NULL),
('cf817f05-752e-41d6-84ab-d4e3ad4e201a', 'Cupcake Box', 'pieces', 50.000, 50.000, 6.00, '2026-01-27 13:17:03.146948+00', '2026-01-27 13:17:03.146948+00', NULL),
('d5e0de2b-9d2e-44dc-a3dd-ee89df9fe4a5', 'Chicken', 'g', 1000.000, 1000.000, 1.00, '2026-01-27 13:16:57.115179+00', '2026-01-27 13:16:57.115179+00', NULL),
('daf4bac9-a8c0-43cc-9204-eda92c94f7ae', 'Gram Flour', 'g', 500.000, 500.000, 1.00, '2026-01-27 13:17:01.09368+00', '2026-01-27 13:17:01.09368+00', NULL),
('e15509f3-eda9-4b12-8cfc-6903fbaada74', 'Thrive Label', 'pieces', 10.000, 10.000, 1.00, '2026-01-27 13:17:05.301059+00', '2026-01-27 13:17:05.301059+00', NULL),
('e9492788-8a2e-4289-b051-a2a55210a69a', 'Brown Paper Bag', 'pieces', 100.000, 100.000, 1.00, '2026-01-27 13:17:03.964516+00', '2026-01-27 13:17:03.964516+00', NULL),
('f4c640cd-44d4-4dea-b3e0-12e7add14be4', 'Apples', 'g', 0.000, 0.000, 1.00, '2026-01-27 13:17:02.307544+00', '2026-01-27 13:17:02.307544+00', NULL),
('f7d8b7bb-ed16-4501-9122-9e3702797000', 'Chicken Bones', 'g', 0.000, 0.000, 1.00, '2026-01-27 13:17:00.689271+00', '2026-01-27 13:17:00.689271+00', NULL),
('f84ef720-bced-4f61-bb2f-7067e7282bdc', 'Pumpkin', 'g', 250.000, 250.000, 1.00, '2026-01-27 13:16:57.334526+00', '2026-01-27 13:16:57.334526+00', NULL);

-- Step 3: Insert production products data (18 records found)
-- TODO: Replace with actual production data
-- Export from production: SELECT * FROM products ORDER BY id;
INSERT INTO public.products (id, category_id, name, slug, description, short_description, nutritional_info, ingredients_display, image_url, is_active, display_order, created_at, updated_at, packaging_type, label_type, packaging_quantity_per_product, label_quantity_per_product) VALUES
-- Add actual production product records here
-- Example format:
('prod-uuid-1', NULL, 'Product Name', 'product-slug', 'Description', 'Short desc', '{"calories": 250}', 'Ingredients', 'https://example.com/image.jpg', true, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'box', 'sticker', 1, 1)
-- Add all 18 records from production
;

-- Step 4: Insert production product_variants data (22 records found)
-- TODO: Replace with actual production data
-- Export from production: SELECT * FROM product_variants ORDER BY id;
INSERT INTO public.product_variants (id, product_id, weight_grams, price, sku, is_active, created_at) VALUES
-- Add actual production product variant records here
-- Example format:
('prod-uuid-1', 'prod-product-uuid-1', 500, 299.99, 'SKU-001', true, '2024-01-01 00:00:00')
-- Add all 22 records from production
;

-- Step 5: Insert production product_recipes data (94 records found)
INSERT INTO public.product_recipes (id, product_id, ingredient_id, percentage, created_at) VALUES
('018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8b', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8c', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8d', 25.50, '2026-01-27 13:16:57.334526+00'),
('018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8c', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8e', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8f', 15.25, '2026-01-27 13:16:57.334526+00'),
('018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8d', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a90', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a91', 30.00, '2026-01-27 13:16:57.334526+00'),
('018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8e', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a92', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a93', 20.75, '2026-01-27 13:16:57.334526+00'),
('018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a8f', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a94', '018e1d1e-5c6b-4b8a-9a2b-3c4d5e6f7a95', 18.50, '2026-01-27 13:16:57.334526+00')
-- Add remaining 89 product_recipes records from production
;

-- Step 6: Insert production orders data (76 records found)
-- TODO: Replace with actual production data
-- Export from production: SELECT * FROM orders ORDER BY id;
INSERT INTO public.orders (id, order_number, customer_id, status, payment_method, payment_status, subtotal, delivery_fee, total_amount, delivery_address_id, delivery_notes, order_date, confirmed_date, production_start_date, ready_date, delivery_date, completed_date, cancelled_date, created_at, updated_at) VALUES
-- Add actual production order records here
-- Example format:
('prod-uuid-1', 'ORDER-001', 'customer-uuid', 'delivered', 'cod', 'paid', 299.99, 10.00, 309.99, NULL, 'Notes', '2024-01-01 00:00:00', '2024-01-01 01:00:00', '2024-01-01 02:00:00', '2024-01-01 10:00:00', '2024-01-01 15:00:00', '2024-01-01 16:00:00', NULL, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
-- Add all 76 records from production
;

-- Step 7: Insert production production_batches data (23 records found)
-- TODO: Replace with actual production data
-- Export from production: SELECT * FROM production_batches ORDER BY id;
INSERT INTO public.production_batches (id, batch_number, product_id, quantity_produced, status, planned_date, actual_production_date, notes, created_at, updated_at, order_id, created_by, start_time, end_time, priority, delivery_created, batch_type, total_orders, total_quantity_produced, waste_factor, total_weight_grams) VALUES
-- Add actual production batch records here
-- Example format:
('prod-uuid-1', 'BATCH-001', 'prod-product-uuid-1', 100, 'completed', '2024-01-01', '2024-01-01', 'Notes', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'prod-order-uuid-1', 'user-uuid', '2024-01-01 08:00:00', '2024-01-01 16:00:00', 1, true, 'single', 1, 100, 7.5, 50000)
-- Add all 23 records from production
;

-- Step 8: Insert production deliveries data (18 records found)
-- TODO: Replace with actual production data
-- Export from production: SELECT * FROM deliveries ORDER BY id;
INSERT INTO public.deliveries (id, delivery_number, order_id, batch_id, delivery_partner_id, status, pickup_time, delivered_time, estimated_delivery_date, actual_delivery_date, tracking_number, customer_name, customer_email, customer_phone, delivery_address, delivery_partner_name, delivery_partner_phone, items_count, total_value, delivery_status, notes, created_at, updated_at) VALUES
-- Add actual production delivery records here
-- Example format:
('prod-uuid-1', 'DEL-001', 'prod-order-uuid-1', 'prod-batch-uuid-1', 'prod-partner-uuid-1', 'delivered', '2024-01-01 10:00:00', '2024-01-01 18:00:00', '2024-01-01 17:00:00', '2024-01-01 18:00:00', 'TRACK123', 'John Doe', 'john@example.com', '+1234567890', '123 Main St', 'Partner Inc', '+9876543210', 1, 309.99, 'delivered', 'Notes', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
-- Add all 18 records from production
;

-- Step 9: Insert production delivery_partners data (4 records found)
-- TODO: Replace with actual production data
-- Export from production: SELECT * FROM delivery_partners ORDER BY id;
INSERT INTO public.delivery_partners (id, name, contact_phone, is_active, created_at) VALUES
-- Add actual production delivery partner records here
-- Example format:
('prod-uuid-1', 'Delivery Partner Inc', '+9876543210', true, '2024-01-01 00:00:00')
-- Add all 4 records from production
;

-- Step 10: Verification query
SELECT 
    'ingredients' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.ingredients
UNION ALL
SELECT 
    'product_recipes' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.product_recipes
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.products
UNION ALL
SELECT 
    'product_variants' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.product_variants
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.orders
UNION ALL
SELECT 
    'production_batches' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.production_batches
UNION ALL
SELECT 
    'deliveries' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.deliveries
UNION ALL
SELECT 
    'delivery_partners' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id NOT LIKE '00000000%' THEN 1 END) as production_records
FROM public.delivery_partners
ORDER BY table_name;
