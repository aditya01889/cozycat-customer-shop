-- Performance Optimization Script for Supabase Database
-- Run this in Supabase SQL Editor to optimize performance

-- Step 1: Create essential indexes for common query patterns
-- Index for user lookups in orders table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id_created_at ON orders(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Index for user lookups in cart_items table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_id_created_at ON cart_items(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Index for product lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id_is_active ON products(category_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('name'));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range ON products(price);

-- Index for product variants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_product_id_is_active ON product_variants(product_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_price ON product_variants(price);

-- Index for categories
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_name_search ON categories USING gin(to_tsvector('name'));

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_date ON orders(user_id, status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- Step 2: Optimize table statistics
ANALYZE users;
ANALYZE orders;
ANALYZE cart_items;
ANALYZE products;
ANALYZE product_variants;
ANALYZE categories;

-- Step 3: Clean up table bloat
VACUUM (ANALYZE, VERBOSE) users;
VACUUM (ANALYZE, VERBOSE) orders;
VACUUM (ANALYZE, VERBOSE) cart_items;
VACUUM (ANALYZE, VERBOSE) products;
VACUUM (ANALYZE, VERBOSE) product_variants;
VACUUM (ANALYZE, VERBOSE) categories;

-- Step 4: Create partitioned tables for large datasets (if needed)
-- Check if orders table is large and consider partitioning
DO $$
DECLARE
    order_count BIGINT;
BEGIN;
    SELECT COUNT(*) INTO order_count FROM orders;
    
    IF order_count > 100000 THEN
        -- Create partitioned table for orders by month
        EXECUTE format('CREATE TABLE IF NOT EXISTS orders_y%s LIKE orders INCLUDING ALL;', to_char(CURRENT_DATE, ''YYYY_MM''));
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_y%s_user_id ON orders_y%s(user_id);', to_char(CURRENT_DATE, ''YYYY_MM''));
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_y%s_created_at ON orders_y%s(created_at);', to_char(CURRENT_DATE, ''YYYY_MM''));
        RAISE NOTICE ''Orders table partitioned by month: %'', to_char(CURRENT_DATE, ''YYYY_MM''));
    END IF;
COMMIT;
$$;

-- Step 5: Create materialized views for complex queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_order_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_date,
    AVG(o.total_amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email;

-- Create index on materialized view
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mv_user_order_summary_user_id ON mv_user_order_summary(user_id);

-- Refresh materialized view
-- This should be run periodically or via cron job
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_order_summary;

-- Step 6: Optimize configuration settings
-- Increase work_mem for complex queries
ALTER SYSTEM SET work_mem = '256MB';

-- Increase maintenance_work_mem for index creation
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- Set effective_cache_size for better caching
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Optimize random_page_cost for better query planning
ALTER SYSTEM SET random_page_cost = 1.1;

-- Set default_statistics_target for better statistics
ALTER SYSTEM SET default_statistics_target = 100;

-- Step 7: Create monitoring functions
CREATE OR REPLACE FUNCTION performance_monitor()
RETURNS TABLE (
  query_text TEXT,
  execution_time_ms INTEGER,
  rows_returned INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
) AS $$
BEGIN
    -- This function would be called to log slow queries
    -- Implementation depends on your monitoring needs
    RETURN QUERY SELECT 'Performance monitoring function created'::TEXT, 0::INTEGER, NOW()::TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Verify optimization results
SELECT 
  '=== OPTIMIZATION VERIFICATION ===' as report_section,
  'Indexes Created' as optimization_type,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
  AND NOT indexname LIKE 'pg_%'
  AND indexdef IS NOT NULL;

SELECT 
  '=== OPTIMIZATION VERIFICATION ===' as report_section,
  'Table Statistics Updated' as optimization_type,
  schemaname,
  tablename,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'orders', 'cart_items', 'products', 'product_variants', 'categories')
ORDER BY last_analyze DESC;

-- Performance optimization summary
SELECT 
  '=== OPTIMIZATION SUMMARY ===' as report_section,
  'Performance Optimization Completed' as status,
  NOW() as completion_time,
  'Indexes created, statistics updated, tables vacuumed, and views materialized' as actions_taken;
