-- Performance Audit Script for Supabase Database
-- Run this in Supabase SQL Editor to analyze performance

-- Step 1: Find slow queries
SELECT 
  '=== SLOW QUERIES ANALYSIS ===' as report_section,
  query,
  calls,
  total_time,
  mean_time,
  rows,
  CASE 
    WHEN mean_time > 1000 THEN 'CRITICAL 🚨'
    WHEN mean_time > 500 THEN 'HIGH 🔴'
    WHEN mean_time > 200 THEN 'MEDIUM 🟡'
    WHEN mean_time > 100 THEN 'LOW 🟢'
    ELSE 'FAST ✅'
  END as performance_level,
  ROUND(mean_time::numeric, 2) as avg_time_ms
  ROUND(total_time::numeric / 1000, 2) as avg_time_sec
  ROUND(calls::numeric) as total_calls
FROM pg_stat_statements 
WHERE mean_time > 50 -- queries taking more than 50ms
  AND calls > 10 -- queries executed more than 10 times
ORDER BY mean_time DESC 
LIMIT 20;

-- Step 2: Analyze table sizes and row counts
SELECT 
  '=== TABLE SIZE ANALYSIS ===' as report_section,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname::regclass, tablename::regclass)) as table_size,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = schemaname AND table_name = tablename) as column_count,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = schemaname AND table_name = tablename) as constraint_count,
  pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) as row_count,
  pg_stat_get_last_vacuum_time(schemaname::regclass, tablename::regclass) as last_vacuum,
  pg_stat_get_last_autovacuum_time(schemaname::regclass, tablename::regclass) as last_autovacuum
  CASE 
    WHEN pg_total_relation_size(schemaname::regclass, tablename::regclass) > 100 * 1024 * 1024 THEN 'LARGE 🔴'
    WHEN pg_total_relation_size(schemaname::regclass, tablename::regclass) > 10 * 1024 * 1024 THEN 'MEDIUM 🟡'
    ELSE 'SMALL 🟢'
  END as size_category
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT IN ('pg_stat_statements', 'pg_stat_user_functions', 'pg_stat_user_tables')
ORDER BY pg_total_relation_size(schemaname::regclass, tablename::regclass) DESC
LIMIT 20;

-- Step 3: Check missing indexes
SELECT 
  '=== MISSING INDEXES ANALYSIS ===' as report_section,
  schemaname,
  tablename,
  attname as column_name,
  CASE 
    WHEN attname = 'id' OR attname LIKE '%_id' OR attname IN ('user_id', 'order_id', 'product_id', 'category_id') THEN 'SHOULD BE INDEXED 🔍'
    WHEN attname LIKE '%email%' OR attname LIKE '%name%' OR attname LIKE '%created_at%' OR attname LIKE '%updated_at%' THEN 'CONSIDER INDEXING 🟡'
    ELSE 'MAY NOT NEED INDEX 🟢'
  END as indexing_priority,
  'SELECT indexname FROM pg_indexes WHERE schemaname = ''' || schemaname || ''' AND tablename = ''' || tablename || ''' AND attname = ''' || attname || '''' ' as has_index
FROM pg_attribute att
JOIN pg_class tbl ON att.attrelid = tbl.oid
JOIN pg_namespace nsp ON att.attnamespace = nsp.oid
WHERE nsp.nspname = schemaname
  AND tbl.relname = tablename
  AND att.attnum > 0
  AND NOT att.attisdropped
  AND attname NOT IN ('tableoid', 'cmax', 'xmax', 'xmin', 'cmin', 'ctid', 'xmax', 'oid')
  AND tbl.relkind = 'r'
ORDER BY tablename, att.attnum;

-- Step 4: Analyze index usage
SELECT 
  '=== INDEX USAGE ANALYSIS ===' as report_section,
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE 
    WHEN idx_scan = 0 THEN 'NEVER USED ❌'
    WHEN idx_scan < 10 THEN 'RARELY USED 🟡'
    WHEN idx_scan < 100 THEN 'OCCASIONALLY USED 🟢'
    ELSE 'FREQUENTLY USED ✅'
  END as usage_frequency,
  pg_size_pretty(pg_relation_size(schemaname::regclass, indexrelid::regclass)) as index_size,
  CASE 
    WHEN idx_tup_read > 0 AND (idx_tup_fetch::numeric / idx_tup_read::numeric) > 2 THEN 'INEFFICIENT 🔴'
    WHEN idx_tup_read > 0 AND (idx_tup_fetch::numeric / idx_tup_read::numeric) > 1.5 THEN 'SUBOPTIMAL 🟡'
    ELSE 'EFFICIENT ✅'
  END as efficiency_rating
FROM pg_stat_user_indexes ui
JOIN pg_class tbl ON ui.schemrelid = tbl.oid
JOIN pg_namespace nsp ON ui.schemaname = nsp.oid
WHERE nsp.nspname = 'public'
  AND tbl.relname IN ('users', 'orders', 'cart_items', 'products', 'product_variants', 'categories')
ORDER BY idx_scan DESC, idx_tup_read DESC
LIMIT 20;

-- Step 5: Check database connections and locks
SELECT 
  '=== CONNECTION ANALYSIS ===' as report_section,
  datname as database_name,
  numbackends as active_connections,
  xact_commit as active_transactions,
  CASE 
    WHEN numbackends > 50 THEN 'HIGH USAGE 🔴'
    WHEN numbackends > 20 THEN 'MEDIUM USAGE 🟡'
    WHEN numbackends > 10 THEN 'LOW USAGE 🟢'
    ELSE 'MINIMAL USAGE 🟢'
  END as connection_level,
  CASE 
    WHEN xact_commit > 10 THEN 'HIGH ACTIVITY 🔴'
    WHEN xact_commit > 5 THEN 'MEDIUM ACTIVITY 🟡'
    WHEN xact_commit > 2 THEN 'LOW ACTIVITY 🟢'
    ELSE 'MINIMAL ACTIVITY 🟢'
  END as activity_level
FROM pg_stat_database 
WHERE datname = current_database();

-- Step 6: Check table bloat (wasted space)
SELECT 
  '=== TABLE BLOAT ANALYSIS ===' as report_section,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname::regclass, tablename::regclass)) as table_size,
  ROUND((pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) * 
    (pg_stat_get_approximate_row_size(schemaname::regclass, tablename::regclass)) / 
    pg_total_relation_size(schemaname::regclass, tablename::regclass))::numeric, 2) as bloat_percentage,
  CASE 
    WHEN (pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) * 
      pg_stat_get_approximate_row_size(schemaname::regclass, tablename::regclass)) / 
      pg_total_relation_size(schemaname::regclass, tablename::regclass))::numeric > 20 THEN 'HIGH BLOAT 🔴'
    WHEN (pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) * 
      pg_stat_get_approximate_row_size(schemaname::regclass, tablename::regclass)) / 
      pg_total_relation_size(schemaname::regclass, tablename::regclass))::numeric > 10 THEN 'MEDIUM BLOAT 🟡'
    WHEN (pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) * 
      pg_stat_get_approximate_row_size(schemaname::regclass, tablename::regclass)) / 
      pg_total_relation_size(schemaname::regclass, tablename::regclass))::numeric > 5 THEN 'LOW BLOAT 🟢'
    ELSE 'MINIMAL BLOAT 🟢'
  END as bloat_level,
  pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) as live_rows,
  pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass) as dead_rows
  ROUND((pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass)::numeric / 
    CASE WHEN pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) = 0 THEN 0
    ELSE pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass)::numeric / pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass)::numeric
    END * 100, 2) as dead_row_percentage
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = nsp.oid
WHERE nsp.nspname = 'public'
  AND c.relkind = 'r'
  AND pg_total_relation_size(c.oid) > 1024 -- tables larger than 1KB
ORDER BY bloat_percentage DESC
LIMIT 15;

-- Step 7: Cache hit ratios
SELECT 
  '=== CACHE PERFORMANCE ANALYSIS ===' as report_section,
  schemaname,
  tablename,
  heap_blks_hit,
  heap_blks_read,
  ROUND((heap_blks_hit::numeric / NULLIF(heap_blks_read::numeric, 1)) * 100, 2) as cache_hit_ratio,
  CASE 
    WHEN (heap_blks_hit::numeric / NULLIF(heap_blks_read::numeric, 1)) * 100 >= 95 THEN 'EXCELLENT ✅'
    WHEN (heap_blks_hit::numeric / NULLIF(heap_blks_read::numeric, 1)) * 100 >= 90 THEN 'GOOD 🟢'
    WHEN (heap_blks_hit::numeric / NULLIF(heap_blks_read::numeric, 1)) * 100 >= 80 THEN 'FAIR 🟡'
    WHEN (heap_blks_hit::numeric / NULLIF(heap_blks_read::numeric, 1)) * 100 >= 70 THEN 'POOR 🔴'
    ELSE 'VERY POOR 🔴'
  END as cache_performance,
  ROUND(heap_blks_hit::numeric / NULLIF(heap_blks_read::numeric, 1)) as hit_ratio
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
  AND heap_blks_read > 0
  AND tablename IN ('users', 'orders', 'cart_items', 'products', 'product_variants', 'categories')
ORDER BY cache_hit_ratio ASC
LIMIT 10;

-- Step 8: Query optimization recommendations
SELECT 
  '=== OPTIMIZATION RECOMMENDATIONS ===' as report_section,
  'ANALYZE users;' as analyze_users,
  'ANALYZE orders;' as analyze_orders,
  'ANALYZE cart_items;' as analyze_cart_items,
  'ANALYZE products;' as analyze_products,
  'ANALYZE product_variants;' as analyze_product_variants,
  'ANALYZE categories;' as analyze_categories,
  'VACUUM ANALYZE users;' as vacuum_users,
  'VACUUM ANALYZE orders;' as vacuum_orders,
  'VACUUM ANALYZE cart_items;' as vacuum_cart_items,
  'VACUUM ANALYZE products;' as vacuum_products,
  'VACUUM ANALYZE product_variants;' as vacuum_product_variants,
  'VACUUM ANALYZE categories;' as vacuum_categories,
  'REINDEX TABLE CONCURRENTLY users;' as reindex_users,
  'REINDEX TABLE CONCURRENTLY orders;' as reindex_orders,
  'REINDEX TABLE CONCURRENTLY cart_items;' as reindex_cart_items,
  'REINDEX TABLE CONCURRENTLY products;' as reindex_products,
  'REINDEX TABLE CONCURRENTLY product_variants;' as reindex_product_variants,
  'REINDEX TABLE CONCURRENTLY categories;' as reindex_categories
FROM (SELECT 1) dummy;
