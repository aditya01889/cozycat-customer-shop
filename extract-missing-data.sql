-- SQL commands to extract missing sections from production database
-- Run these queries to get JSON data for the missing tables
-- Copy the output and add it to production-missing-data.md

-- 1. Extract order_items data
SELECT json_agg(
    json_build_object(
        'id', id,
        'order_id', order_id,
        'product_variant_id', product_variant_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'total_price', total_price,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY id
) AS order_items_json
FROM order_items;

-- 2. Extract categories data  
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'slug', slug,
        'display_order', display_order,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY display_order, name
) AS categories_json
FROM categories;

-- 3. Extract packaging data
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'unit_cost', unit_cost,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY name
) AS packaging_json
FROM packaging;

-- 4. Extract labels data
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'unit_cost', unit_cost,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY name
) AS labels_json
FROM labels;

-- 5. Extract customers data
SELECT json_agg(
    json_build_object(
        'id', id,
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
        'address_line1', address_line1,
        'address_line2', address_line2,
        'city', city,
        'state', state,
        'pincode', pincode,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY created_at DESC
) AS customers_json
FROM customers;

-- Alternative: If you want individual queries for easier copying:

-- Order Items (run this and copy the JSON result)
/*
SELECT json_agg(
    json_build_object(
        'id', id,
        'order_id', order_id,
        'product_variant_id', product_variant_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'total_price', total_price,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY id
) FROM order_items;
*/

-- Categories (run this and copy the JSON result)
/*
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'slug', slug,
        'display_order', display_order,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY display_order, name
) FROM categories;
*/

-- Packaging (run this and copy the JSON result)
/*
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'unit_cost', unit_cost,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY name
) FROM packaging;
*/

-- Labels (run this and copy the JSON result)
/*
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'unit_cost', unit_cost,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY name
) FROM labels;
*/

-- Customers (run this and copy the JSON result)
/*
SELECT json_agg(
    json_build_object(
        'id', id,
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
        'address_line1', address_line1,
        'address_line2', address_line2,
        'city', city,
        'state', state,
        'pincode', pincode,
        'is_active', is_active,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY created_at DESC
) FROM customers;
*/
