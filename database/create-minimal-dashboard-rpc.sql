-- Minimal Dashboard RPC Functions - Only Uses Confirmed Existing Columns
-- Based on existing working RPC functions

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
      AND created_at >= COALESCE(start_date::timestamp, '1900-01-01'::timestamp)
      AND created_at <= COALESCE(end_date::timestamp, '2100-12-31'::timestamp)
      ORDER BY created_at DESC 
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

-- 3. Revenue analytics with time grouping
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_stats_optimized TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_stats_filtered TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_analytics TO authenticated;
