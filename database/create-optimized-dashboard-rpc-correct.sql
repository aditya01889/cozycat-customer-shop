-- Enhanced Dashboard RPC Functions with Pagination and Filtering
-- Phase 3.1: API Layer Optimization - CORRECTED VERSION
-- Based on actual database schema

-- 1. Optimized dashboard stats with pagination and date filtering
CREATE OR REPLACE FUNCTION get_dashboard_stats_optimized(
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  total_products bigint,
  total_orders bigint,
  total_users bigint,
  total_revenue decimal,
  pending_orders bigint,
  recent_orders json,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM orders 
     WHERE status != 'cancelled' 
     AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
     AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)) as total_orders,
    (SELECT COUNT(*) FROM profiles) as total_users,
    COALESCE((SELECT SUM(total_amount::decimal) FROM orders 
              WHERE status != 'cancelled'
              AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
              AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)), 0) as total_revenue,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
    (SELECT json_agg(
      json_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'customer_name', p.full_name,
        'customer_email', p.email,
        'total_amount', o.total_amount,
        'status', o.status,
        'created_at', o.created_at
      )
    ) FROM (
      SELECT o.id, o.order_number, o.customer_id, o.total_amount, o.status, o.created_at, p.full_name, p.email
      FROM orders o
      LEFT JOIN profiles p ON o.customer_id = p.id
      WHERE o.status != 'cancelled' 
      AND o.created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
      AND o.created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
      ORDER BY o.created_at DESC 
      LIMIT limit_count OFFSET offset_count
    ) recent_orders_data) as recent_orders,
    (SELECT COUNT(*) FROM orders 
     WHERE status != 'cancelled'
     AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
     AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)) as total_count;
END;
$$;

-- 2. Order statistics with date filtering
CREATE OR REPLACE FUNCTION get_order_stats_filtered(
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL
)
RETURNS TABLE (
  status text,
  count bigint,
  total_amount decimal,
  percentage decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_orders_count bigint;
BEGIN
  -- Get total orders count for percentage calculation
  SELECT COUNT(*) INTO total_orders_count
  FROM orders 
  WHERE status != 'cancelled'
  AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
  AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp);

  RETURN QUERY
  SELECT 
    status,
    COUNT(*) as count,
    COALESCE(SUM(total_amount::decimal), 0) as total_amount,
    CASE 
      WHEN total_orders_count > 0 THEN 
        ROUND((COUNT(*)::decimal / total_orders_count::decimal) * 100, 2)
      ELSE 0 
    END as percentage
  FROM orders 
  WHERE status != 'cancelled'
  AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
  AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
  GROUP BY status
  ORDER BY count DESC;
END;
$$;

-- 3. Product performance with pagination and filtering
CREATE OR REPLACE FUNCTION get_product_performance_paginated(
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0,
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  category text,
  total_sold bigint,
  total_revenue decimal,
  average_order_value decimal,
  order_count bigint,
  last_order_date timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category as category,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.total_price::decimal), 0) as total_revenue,
    CASE 
      WHEN COUNT(DISTINCT o.id) > 0 THEN 
        ROUND(COALESCE(SUM(oi.total_price::decimal), 0) / COUNT(DISTINCT o.id), 2)
      ELSE 0 
    END as average_order_value,
    COUNT(DISTINCT o.id) as order_count,
    MAX(o.created_at) as last_order_date
  FROM products p
  LEFT JOIN order_items oi ON p.id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id 
    AND o.status != 'cancelled'
    AND o.created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
    AND o.created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
  WHERE p.is_active = true
  GROUP BY p.id, p.name, p.category
  HAVING COUNT(DISTINCT o.id) > 0
  ORDER BY total_revenue DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 4. Recent activity with pagination and filtering
CREATE OR REPLACE FUNCTION get_recent_activity_paginated(
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0,
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL
)
RETURNS TABLE (
  activity_id uuid,
  activity_type text,
  description text,
  customer_id uuid,
  customer_name text,
  customer_email text,
  created_at timestamp,
  metadata json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as activity_id,
    'order_created' as activity_type,
    'New order placed' as description,
    o.customer_id as customer_id,
    p.full_name as customer_name,
    p.email as customer_email,
    o.created_at as created_at,
    json_build_object(
      'order_id', o.id,
      'order_number', o.order_number,
      'customer_name', p.full_name,
      'customer_email', p.email,
      'total_amount', o.total_amount,
      'status', o.status
    ) as metadata
  FROM orders o
  LEFT JOIN profiles p ON o.customer_id = p.id
  WHERE o.created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
  AND o.created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
  ORDER BY o.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 5. Customer analytics with pagination
CREATE OR REPLACE FUNCTION get_customer_analytics_paginated(
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0,
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL
)
RETURNS TABLE (
  customer_id uuid,
  customer_name text,
  customer_email text,
  total_orders bigint,
  total_spent decimal,
  average_order_value decimal,
  first_order_date timestamp,
  last_order_date timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as customer_id,
    p.full_name as customer_name,
    p.email as customer_email,
    COALESCE(o.order_count, 0) as total_orders,
    COALESCE(o.total_spent, 0) as total_spent,
    CASE 
      WHEN o.order_count > 0 THEN 
        ROUND(o.total_spent / o.order_count, 2)
      ELSE 0 
    END as average_order_value,
    o.first_order_date,
    o.last_order_date
  FROM profiles p
  LEFT JOIN (
    SELECT 
      customer_id,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount::decimal), 0) as total_spent,
      MIN(created_at) as first_order_date,
      MAX(created_at) as last_order_date
    FROM orders 
    WHERE status != 'cancelled'
    AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
    AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
    GROUP BY customer_id
  ) o ON p.id = o.customer_id
  WHERE p.role = 'customer'
  ORDER BY o.total_spent DESC NULLS LAST
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 6. Revenue analytics with time grouping
CREATE OR REPLACE FUNCTION get_revenue_analytics(
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL,
  group_by text DEFAULT 'day' -- 'day', 'week', 'month'
)
RETURNS TABLE (
  period_start timestamp,
  period_end timestamp,
  revenue decimal,
  order_count bigint,
  average_order_value decimal,
  growth_rate decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH revenue_data AS (
    SELECT 
      CASE 
        WHEN group_by = 'day' THEN DATE_TRUNC('day', created_at)
        WHEN group_by = 'week' THEN DATE_TRUNC('week', created_at)
        WHEN group_by = 'month' THEN DATE_TRUNC('month', created_at)
        ELSE DATE_TRUNC('day', created_at)
      END as period,
      COALESCE(SUM(total_amount::decimal), 0) as revenue,
      COUNT(*) as order_count
    FROM orders 
    WHERE status != 'cancelled'
    AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
    AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
    GROUP BY 
      CASE 
        WHEN group_by = 'day' THEN DATE_TRUNC('day', created_at)
        WHEN group_by = 'week' THEN DATE_TRUNC('week', created_at)
        WHEN group_by = 'month' THEN DATE_TRUNC('month', created_at)
        ELSE DATE_TRUNC('day', created_at)
      END
    ORDER BY period
  ),
  revenue_with_lag AS (
    SELECT 
      period,
      revenue,
      order_count,
      LAG(revenue) OVER (ORDER BY period) as previous_revenue
    FROM revenue_data
  )
  SELECT 
    period as period_start,
    CASE 
      WHEN group_by = 'day' THEN period + INTERVAL '1 day'
      WHEN group_by = 'week' THEN period + INTERVAL '1 week'
      WHEN group_by = 'month' THEN period + INTERVAL '1 month'
      ELSE period + INTERVAL '1 day'
    END as period_end,
    revenue,
    order_count,
    CASE 
      WHEN order_count > 0 THEN ROUND(revenue / order_count, 2)
      ELSE 0 
    END as average_order_value,
    CASE 
      WHEN previous_revenue > 0 THEN 
        ROUND(((revenue - previous_revenue) / previous_revenue) * 100, 2)
      ELSE NULL 
    END as growth_rate
  FROM revenue_with_lag;
END;
$$;

-- 7. Inventory analytics
CREATE OR REPLACE FUNCTION get_inventory_analytics()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  category text,
  current_stock integer,
  reorder_level integer,
  stock_status text,
  days_since_last_order integer,
  monthly_sales_rate decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category as category,
    COALESCE(p.stock_quantity, 0) as current_stock,
    COALESCE(p.reorder_level, 10) as reorder_level,
    CASE 
      WHEN COALESCE(p.stock_quantity, 0) = 0 THEN 'out_of_stock'
      WHEN COALESCE(p.stock_quantity, 0) <= COALESCE(p.reorder_level, 10) THEN 'low_stock'
      ELSE 'in_stock'
    END as stock_status,
    EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - MAX(o.created_at)))::integer as days_since_last_order,
    CASE 
      WHEN MAX(o.created_at) >= CURRENT_TIMESTAMP - INTERVAL '30 days' THEN
        ROUND(COALESCE(SUM(oi.quantity), 0) / 30.0, 2)
      ELSE 0
    END as monthly_sales_rate
  FROM products p
  LEFT JOIN order_items oi ON p.id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id 
    AND o.status != 'cancelled'
    AND o.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
  WHERE p.is_active = true
  GROUP BY p.id, p.name, p.category, p.stock_quantity, p.reorder_level
  ORDER BY 
    CASE 
      WHEN COALESCE(p.stock_quantity, 0) = 0 THEN 1
      WHEN COALESCE(p.stock_quantity, 0) <= COALESCE(p.reorder_level, 10) THEN 2
      ELSE 3
    END,
    monthly_sales_rate DESC NULLS LAST;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id_created_at ON orders(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, stock_quantity);
CREATE INDEX IF NOT EXISTS idx_profiles_role_email ON profiles(role, email);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_stats_optimized TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_stats_filtered TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_performance_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_analytics_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_inventory_analytics TO authenticated;
