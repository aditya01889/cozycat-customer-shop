-- Dashboard Optimization SQL Functions
-- These functions optimize dashboard data aggregation

-- 1. Optimized Dashboard Stats Function
CREATE OR REPLACE FUNCTION get_dashboard_stats_optimized(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    total_products BIGINT,
    total_orders BIGINT,
    total_users BIGINT,
    total_revenue DECIMAL,
    pending_orders BIGINT,
    recent_orders JSONB,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    date_filter_start DATE := COALESCE(start_date, '1900-01-01'::DATE);
    date_filter_end DATE := COALESCE(end_date, '2100-12-31'::DATE);
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
            (SELECT COUNT(*) FROM orders WHERE status != 'cancelled' AND created_at >= date_filter_start AND created_at <= date_filter_end) as total_orders,
            (SELECT COUNT(*) FROM profiles) as total_users,
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled' AND created_at >= date_filter_start AND created_at <= date_filter_end) as total_revenue,
            (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
            (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') as total_count
    ),
    recent_orders AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'customer_email', customer_email,
                'total_amount', total_amount,
                'status', status,
                'created_at', created_at
            )
        ) as recent_orders_data
        FROM orders 
        WHERE status != 'cancelled' 
        AND created_at >= date_filter_start 
        AND created_at <= date_filter_end
        ORDER BY created_at DESC 
        LIMIT limit_count OFFSET offset_count
    )
    SELECT 
        s.total_products,
        s.total_orders,
        s.total_users,
        s.total_revenue,
        s.pending_orders,
        COALESCE(ro.recent_orders_data, '[]'::jsonb) as recent_orders,
        s.total_count
    FROM stats s
    CROSS JOIN recent_orders ro;
END;
$$;

-- 2. Order Stats with Filtering
CREATE OR REPLACE FUNCTION get_order_stats_filtered(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    status TEXT,
    count BIGINT,
    total_amount DECIMAL,
    avg_amount DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    date_filter_start DATE := COALESCE(start_date, '1900-01-01'::DATE);
    date_filter_end DATE := COALESCE(end_date, '2100-12-31'::DATE);
BEGIN
    RETURN QUERY
    SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(AVG(total_amount), 0) as avg_amount
    FROM orders 
    WHERE created_at >= date_filter_start 
    AND created_at <= date_filter_end
    GROUP BY status
    ORDER BY count DESC;
END;
$$;

-- 3. Product Performance with Pagination
CREATE OR REPLACE FUNCTION get_product_performance_paginated(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    total_orders BIGINT,
    total_revenue DECIMAL,
    avg_order_value DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    date_filter_start DATE := COALESCE(start_date, '1900-01-01'::DATE);
    date_filter_end DATE := COALESCE(end_date, '2100-12-31'::DATE);
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        COUNT(oi.id) as total_orders,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
        COALESCE(AVG(oi.quantity * oi.price), 0) as avg_order_value
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= date_filter_start 
    AND o.created_at <= date_filter_end
    OR o.created_at IS NULL
    GROUP BY p.id, p.name
    ORDER BY total_revenue DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 4. Recent Activity with Pagination
CREATE OR REPLACE FUNCTION get_recent_activity_paginated(
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    activity_id UUID,
    activity_type TEXT,
    description TEXT,
    created_at TIMESTAMP,
    user_email TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    date_filter_start DATE := COALESCE(start_date, '1900-01-01'::DATE);
    date_filter_end DATE := COALESCE(end_date, '2100-12-31'::DATE);
BEGIN
    RETURN QUERY
    SELECT 
        o.id as activity_id,
        'order_created' as activity_type,
        'New order placed' as description,
        o.created_at,
        o.customer_email as user_email
    FROM orders o
    WHERE o.created_at >= date_filter_start 
    AND o.created_at <= date_filter_end
    UNION ALL
    SELECT 
        p.id as activity_id,
        'user_registered' as activity_type,
        'New user registered' as description,
        p.created_at,
        p.email as user_email
    FROM profiles p
    WHERE p.created_at >= date_filter_start 
    AND p.created_at <= date_filter_end
    ORDER BY created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 5. Create Indexes for Dashboard Performance
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_stats_optimized TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_stats_filtered TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_performance_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity_paginated TO authenticated;
