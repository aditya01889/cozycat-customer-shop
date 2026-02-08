-- Performance Optimization - Essential Indexes
-- Step 3.2: Create Essential Indexes for Common Query Patterns
-- Migration: 20260208170000_performance_indexes.sql

-- =====================================================
-- PERFORMANCE INDEXES IMPLEMENTATION
-- =====================================================

-- 1. Orders Table Indexes (High Priority)
-- Index for customer order lookups with date sorting
CREATE INDEX IF NOT EXISTS idx_orders_customer_id_created_at 
ON orders(customer_id, created_at DESC);

-- Index for order status filtering with date sorting
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON orders(status, created_at DESC);

-- Index for order amount queries (for revenue calculations)
CREATE INDEX IF NOT EXISTS idx_orders_total_amount 
ON orders(total_amount);

-- Composite index for complex order queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_status_date 
ON orders(customer_id, status, created_at DESC);

-- 2. Cart Items Table Indexes (High Priority)
-- NOTE: Uncomment these indexes if cart_items table exists
-- Index for user cart lookups
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_id_created_at 
-- ON cart_items(user_id, created_at DESC);

-- Index for product popularity analysis
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_product_id 
-- ON cart_items(product_id);

-- Composite index for user-product cart queries
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_product 
-- ON cart_items(user_id, product_id);

-- 3. Products Table Indexes (High Priority)
-- Index for category filtering with active status
CREATE INDEX IF NOT EXISTS idx_products_category_id_is_active 
ON products(category_id, is_active, display_order);

-- Index for product slug lookups (SEO friendly URLs)
CREATE INDEX IF NOT EXISTS idx_products_slug 
ON products(slug) WHERE is_active = true;

-- Index for product name search (full-text search)
CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(to_tsvector('english', name));

-- Note: Price queries should use product_variants.price index instead

-- 4. Product Variants Table Indexes (Medium Priority)
-- Index for product variant lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id_is_active 
ON product_variants(product_id, is_active);

-- Index for variant price queries
CREATE INDEX IF NOT EXISTS idx_product_variants_price 
ON product_variants(price) WHERE is_active = true;

-- Index for variant SKU lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_sku 
ON product_variants(sku) WHERE is_active = true;

-- 5. Categories Table Indexes (Low Priority)
-- Note: No parent_id column in categories table
-- Index for category name search
CREATE INDEX IF NOT EXISTS idx_categories_name_search 
ON categories USING gin(to_tsvector('english', name));

-- Index for category display order
CREATE INDEX IF NOT EXISTS idx_categories_display_order 
ON categories(display_order);

-- 6. Users/Profiles Table Indexes (Medium Priority)
-- Index for user email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Index for user phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
ON profiles(phone) WHERE phone IS NOT NULL;

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- 7. Update table statistics for better query planning
ANALYZE orders;
-- ANALYZE cart_items; -- Uncomment if cart_items table exists
ANALYZE products;
ANALYZE product_variants;
ANALYZE categories;
ANALYZE profiles;

-- 8. Clean up table bloat (optional - can be run during maintenance)
-- VACUUM (ANALYZE, VERBOSE) orders;
-- VACUUM (ANALYZE, VERBOSE) cart_items;
-- VACUUM (ANALYZE, VERBOSE) products;
-- VACUUM (ANALYZE, VERBOSE) product_variants;
-- VACUUM (ANALYZE, VERBOSE) categories;
-- VACUUM (ANALYZE, VERBOSE) profiles;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify indexes were created successfully
SELECT 
    '=== INDEX CREATION VERIFICATION ===' as section,
    schemaname,
    tablename,
    indexname,
    indexdef,
    CASE 
        WHEN indexdef LIKE '%CONCURRENTLY%' THEN 'CREATED CONCURRENTLY ✅'
        ELSE 'CREATED ✅'
    END as creation_status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND tablename IN ('orders', 'products', 'product_variants', 'categories', 'profiles')
ORDER BY tablename, indexname;

-- Show index usage statistics (will populate after queries run)
SELECT 
    '=== INDEX USAGE STATISTICS ===' as section,
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN 'NOT USED YET ⏳'
        WHEN idx_scan < 10 THEN 'RARELY USED 🟡'
        ELSE 'ACTIVE ✅'
    END as usage_status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
  AND indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC, relname;

-- Performance optimization summary
SELECT 
    '=== PERFORMANCE OPTIMIZATION SUMMARY ===' as section,
    'Essential Indexes Created' as optimization_type,
    COUNT(*) as total_indexes_created,
    NOW() as completion_timestamp,
    'Performance optimization completed - indexes created for orders, products, variants, categories, and profiles' as description
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- =====================================================
-- NEXT STEPS
-- =====================================================

-- After this migration:
-- 1. Monitor query performance using pg_stat_statements
-- 2. Check index usage after application usage
-- 3. Consider adding more indexes based on actual query patterns
-- 4. Schedule regular ANALYZE operations
-- 5. Monitor index size vs performance benefit

-- To check performance improvements:
-- SELECT * FROM scripts/performance/audit.sql (re-run after migration)
