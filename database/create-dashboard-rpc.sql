-- Dashboard Aggregation RPC Functions
-- Combines multiple queries into single database calls for better performance

-- Function to get all dashboard statistics in one call
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_products bigint,
  total_orders bigint,
  total_users bigint,
  total_revenue decimal,
  pending_orders bigint,
  recent_orders json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') as total_orders,
    (SELECT COUNT(*) FROM profiles) as total_users,
    COALESCE((SELECT SUM(total_amount::decimal) FROM orders WHERE status != 'cancelled'), 0) as total_revenue,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
    (SELECT json_agg(
      json_build_object(
        'id', id,
        'customer_name', customer_name,
        'total_amount', total_amount,
        'status', status,
        'created_at', created_at
      )
    ) FROM (
      SELECT id, customer_name, total_amount, status, created_at 
      FROM orders 
      WHERE status != 'cancelled' 
      ORDER BY created_at DESC 
      LIMIT 5
    ) recent_orders_data) as recent_orders;
END;
$$;

-- Function to get order statistics by status
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
  status text,
  count bigint,
  total_amount decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    status,
    COUNT(*) as count,
    COALESCE(SUM(total_amount::decimal), 0) as total_amount
  FROM orders 
  WHERE status != 'cancelled'
  GROUP BY status
  ORDER BY count DESC;
END;
$$;

-- Function to get product performance metrics
CREATE OR REPLACE FUNCTION get_product_performance()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  total_orders bigint,
  total_revenue decimal,
  avg_order_value decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COALESCE(oi.order_count, 0) as total_orders,
    COALESCE(oi.total_revenue, 0) as total_revenue,
    CASE 
      WHEN oi.order_count > 0 THEN oi.total_revenue / oi.order_count
      ELSE 0
    END as avg_order_value
  FROM products p
  LEFT JOIN (
    SELECT 
      product_id,
      COUNT(*) as order_count,
      SUM(quantity * price::decimal) as total_revenue
    FROM order_items
    GROUP BY product_id
  ) oi ON p.id = oi.product_id
  WHERE p.is_active = true
  ORDER BY total_revenue DESC
  LIMIT 10;
END;
$$;

-- Function to get recent activity (orders, users, etc.)
CREATE OR REPLACE FUNCTION get_recent_activity(limit_count int DEFAULT 10)
RETURNS TABLE (
  activity_type text,
  activity_id uuid,
  description text,
  created_at timestamp,
  metadata json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'order' as activity_type,
    o.id as activity_id,
    'New order #' || o.id as description,
    o.created_at,
    json_build_object(
      'customer_name', o.customer_name,
      'total_amount', o.total_amount,
      'status', o.status
    ) as metadata
  FROM orders o
  WHERE o.created_at >= NOW() - INTERVAL '7 days'
  
  UNION ALL
  
  SELECT 
    'user' as activity_type,
    p.id as activity_id,
    'New user: ' || COALESCE(p.full_name, p.email) as description,
    p.created_at,
    json_build_object(
      'email', p.email,
      'role', p.role
    ) as metadata
  FROM profiles p
  WHERE p.created_at >= NOW() - INTERVAL '7 days'
  
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity(int) TO authenticated;

-- Grant read permissions for anonymous access to public functions (if needed)
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon;
