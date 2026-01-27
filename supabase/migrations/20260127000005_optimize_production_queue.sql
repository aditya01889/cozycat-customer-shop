-- Create optimized function to get all production queue data in a single call
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
    order_item_count INTEGER,
    total_weight DECIMAL(10,3)
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

-- Create optimized function for cumulative requirements
CREATE OR REPLACE FUNCTION get_cumulative_requirements_optimized()
RETURNS TABLE (
    ingredient_id UUID,
    ingredient_name TEXT,
    total_required DECIMAL(10,3),
    current_stock DECIMAL(10,3),
    shortage DECIMAL(10,3),
    affected_orders TEXT[],
    supplier_name TEXT,
    supplier_phone TEXT,
    supplier_email TEXT,
    affected_order_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH 
    -- Get all ingredient requirements for all pending orders
    all_requirements AS (
        SELECT 
            o.id as order_id,
            o.order_number,
            ir.ingredient_id,
            ir.ingredient_name,
            ir.required_quantity,
            ir.current_stock,
            ir.supplier_name,
            ir.supplier_phone,
            ir.supplier_email
        FROM orders o
        CROSS JOIN LATERAL calculate_order_ingredient_requirements(o.id) ir
        WHERE o.status IN ('pending', 'confirmed', 'processing')
    ),
    
    -- Aggregate by ingredient
    ingredient_aggregates AS (
        SELECT 
            ingredient_id,
            ingredient_name,
            SUM(required_quantity) as total_required,
            MAX(current_stock) as current_stock, -- Use latest stock
            MAX(supplier_name) as supplier_name,
            MAX(supplier_phone) as supplier_phone,
            MAX(supplier_email) as supplier_email,
            ARRAY_AGG(order_number ORDER BY order_number) as affected_orders,
            COUNT(DISTINCT order_id) as affected_order_count
        FROM all_requirements
        GROUP BY ingredient_id, ingredient_name
    )
    
    SELECT 
        ia.ingredient_id,
        ia.ingredient_name,
        ia.total_required,
        ia.current_stock,
        GREATEST(0, ia.total_required - ia.current_stock) as shortage,
        ia.affected_orders,
        ia.supplier_name,
        ia.supplier_phone,
        ia.supplier_email,
        ia.affected_order_count
    FROM ingredient_aggregates ia
    ORDER BY 
        CASE 
            WHEN GREATEST(0, ia.total_required - ia.current_stock) > 0 THEN 1
            ELSE 2
        END,
        ia.ingredient_name;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON FUNCTION get_production_queue_optimized() TO authenticated, service_role;
GRANT ALL ON FUNCTION get_cumulative_requirements_optimized() TO authenticated, service_role;
