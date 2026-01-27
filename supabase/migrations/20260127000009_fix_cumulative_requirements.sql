-- Fix the ambiguous column reference in get_cumulative_requirements_optimized function
DROP FUNCTION IF EXISTS get_cumulative_requirements_optimized();

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
    affected_order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH 
    -- Get all ingredient requirements for all pending orders
    all_requirements AS (
        SELECT 
            orders.id as order_id,
            orders.order_number,
            ir.ingredient_id,
            ir.ingredient_name,
            ir.required_quantity,
            ir.current_stock,
            ir.supplier_name,
            ir.supplier_phone,
            ir.supplier_email
        FROM orders
        CROSS JOIN LATERAL calculate_order_ingredient_requirements(orders.id) ir
        WHERE orders.status IN ('pending', 'confirmed', 'processing')
    ),
    
    -- Aggregate by ingredient
    ingredient_aggregates AS (
        SELECT 
            all_req.ingredient_id,
            all_req.ingredient_name,
            SUM(all_req.required_quantity) as total_required,
            MAX(all_req.current_stock) as current_stock, -- Use latest stock
            MAX(all_req.supplier_name) as supplier_name,
            MAX(all_req.supplier_phone) as supplier_phone,
            MAX(all_req.supplier_email) as supplier_email,
            ARRAY_AGG(all_req.order_number ORDER BY all_req.order_number) as affected_orders,
            COUNT(DISTINCT all_req.order_id) as affected_order_count
        FROM all_requirements all_req
        GROUP BY all_req.ingredient_id, all_req.ingredient_name
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
