-- Fix the total_weight type mismatch in get_production_queue_optimized function
DROP FUNCTION IF EXISTS get_production_queue_optimized();

CREATE OR REPLACE FUNCTION get_production_queue_optimized()
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    order_status TEXT,
    order_created_at TIMESTAMPTZ,
    total_amount DECIMAL(10,2),
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    ingredient_id UUID,
    ingredient_name TEXT,
    required_quantity DECIMAL(10,3),
    current_stock DECIMAL(10,3),
    shortage DECIMAL(10,3),
    supplier_name TEXT,
    supplier_phone TEXT,
    supplier_email TEXT,
    order_item_count BIGINT,
    total_weight BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH 
    -- Get orders with customer info
    orders_with_customers AS (
        SELECT 
            orders.id as order_id,
            orders.order_number,
            orders.status as order_status,
            orders.created_at as order_created_at,
            orders.total_amount,
            orders.customer_id,
            COALESCE(profiles.full_name, 'Unknown Customer') as customer_name,
            profiles.email as customer_email
        FROM orders
        LEFT JOIN profiles ON orders.customer_id = profiles.id
        WHERE orders.status IN ('pending', 'confirmed', 'processing')
    ),
    
    -- Get order items with product info
    order_items_summary AS (
        SELECT 
            order_items.order_id,
            COUNT(order_items.id) as order_item_count,
            SUM(order_items.quantity * COALESCE(product_variants.weight_grams, 0)) as total_weight
        FROM order_items
        LEFT JOIN product_variants ON order_items.product_variant_id = product_variants.id
        GROUP BY order_items.order_id
    ),
    
    -- Get order items details for individual orders
    order_items_details AS (
        SELECT 
            order_items.id,
            order_items.order_id,
            order_items.quantity,
            order_items.unit_price,
            order_items.total_price,
            order_items.created_at,
            product_variants.id as variant_id,
            product_variants.weight_grams,
            products.name as product_name
        FROM order_items
        LEFT JOIN product_variants ON order_items.product_variant_id = product_variants.id
        LEFT JOIN products ON product_variants.product_id = products.id
    ),
    
    -- Get all ingredient requirements for all orders at once
    all_ingredient_requirements AS (
        SELECT 
            owc.order_id,
            ir.ingredient_id,
            ir.ingredient_name,
            ir.required_quantity,
            ir.current_stock,
            ir.required_quantity - ir.current_stock as shortage,
            ir.supplier_name,
            ir.supplier_phone,
            ir.supplier_email
        FROM orders_with_customers owc
        CROSS JOIN LATERAL calculate_order_ingredient_requirements(owc.order_id) ir
    )
    
    -- Combine all data
    SELECT 
        owc.order_id,
        owc.order_number,
        owc.order_status,
        owc.order_created_at,
        owc.total_amount,
        owc.customer_id,
        owc.customer_name,
        owc.customer_email,
        air.ingredient_id,
        air.ingredient_name,
        air.required_quantity,
        air.current_stock,
        air.shortage,
        air.supplier_name,
        air.supplier_phone,
        air.supplier_email,
        COALESCE(ois.order_item_count, 0) as order_item_count,
        COALESCE(ois.total_weight, 0) as total_weight
    FROM orders_with_customers owc
    LEFT JOIN order_items_summary ois ON owc.order_id = ois.order_id
    LEFT JOIN all_ingredient_requirements air ON owc.order_id = air.order_id
    ORDER BY owc.order_created_at ASC;
END;
$$ LANGUAGE plpgsql;
