#!/usr/bin/env node

/**
 * Performance Verification Script
 * Compares before/after performance metrics and generates reports
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RESULTS_DIR = path.join(__dirname, '../results');
const VERIFICATION_FILE = path.join(RESULTS_DIR, `performance-verification-${new Date().toISOString().split('T')[0]}.json`);

console.log('🔍 Performance Verification Script');
console.log('==================================');

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const verificationSQL = `
-- =====================================================
-- PERFORMANCE VERIFICATION & COMPARISON
-- =====================================================

-- 1. Index Performance Verification
SELECT 
    '=== INDEX PERFORMANCE VERIFICATION ===' as section,
    schemaname,
    tablename,
    indexname,
    idx_scan as usage_count,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED ❌'
        WHEN idx_scan < 10 THEN 'LOW USAGE 🟡'
        WHEN idx_scan < 100 THEN 'MODERATE USAGE 🟢'
        ELSE 'HIGH USAGE ✅'
    END as usage_rating,
    ROUND(
        CASE 
            WHEN idx_tup_read > 0 THEN (idx_tup_fetch::numeric / idx_tup_read::numeric) * 100
            ELSE 0
        END, 2
    ) as efficiency_percentage
FROM pg_stat_user_indexes 
JOIN pg_class tbl ON schemrelid = tbl.oid
JOIN pg_namespace nsp ON schemaname = nsp.oid
WHERE nsp.nspname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC, efficiency_percentage DESC;

-- 2. Query Performance Comparison
SELECT 
    '=== QUERY PERFORMANCE COMPARISON ===' as section,
    query,
    calls,
    ROUND(mean_time::numeric, 2) as avg_time_ms,
    ROUND(total_time::numeric / 1000, 2) as total_time_sec,
    rows,
    CASE 
        WHEN mean_time < 50 THEN 'EXCELLENT ✅'
        WHEN mean_time < 100 THEN 'GOOD 🟢'
        WHEN mean_time < 200 THEN 'ACCEPTABLE 🟡'
        WHEN mean_time < 500 THEN 'SLOW 🔴'
        ELSE 'VERY SLOW 🚨'
    END as performance_rating
FROM pg_stat_statements 
WHERE query NOT LIKE '%pg_stat_statements%'
  AND calls > 5
ORDER BY mean_time ASC, calls DESC
LIMIT 15;

-- 3. Table Size and Bloat Analysis
SELECT 
    '=== TABLE SIZE & BLOAT ANALYSIS ===' as section,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname::regclass, tablename::regclass)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname::regclass, tablename::regclass)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname::regclass, tablename::regclass) - pg_relation_size(schemaname::regclass, tablename::regclass)) as index_size,
    pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) as live_rows,
    pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass) as dead_rows,
    ROUND(
        CASE 
            WHEN pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) > 0 
            THEN (pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass)::numeric / 
                  pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass)::numeric) * 100
            ELSE 0
        END, 2
    ) as bloat_percentage,
    CASE 
        WHEN pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) > 0 
             AND (pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass)::numeric / 
                  pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass)::numeric) > 20 
        THEN 'HIGH BLOAT 🔴'
        WHEN pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass) > 0 
             AND (pg_stat_get_dead_tuples(schemaname::regclass, tablename::regclass)::numeric / 
                  pg_stat_get_live_tuples(schemaname::regclass, tablename::regclass)::numeric) > 10 
        THEN 'MEDIUM BLOAT 🟡'
        ELSE 'LOW BLOAT 🟢'
    END as bloat_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'cart_items', 'products', 'product_variants', 'categories', 'profiles')
ORDER BY pg_total_relation_size(schemaname::regclass, tablename::regclass) DESC;

-- 4. Cache Hit Ratio Analysis
SELECT 
    '=== CACHE PERFORMANCE ANALYSIS ===' as section,
    schemaname,
    tablename,
    heap_blks_hit as cache_hits,
    heap_blks_read as cache_reads,
    ROUND(
        CASE 
            WHEN heap_blks_read + heap_blks_hit > 0 
            THEN (heap_blks_hit::numeric / (heap_blks_read + heap_blks_hit)::numeric) * 100
            ELSE 0
        END, 2
    ) as cache_hit_ratio,
    CASE 
        WHEN heap_blks_read + heap_blks_hit = 0 THEN 'NO DATA ⚪'
        WHEN (heap_blks_hit::numeric / (heap_blks_read + heap_blks_hit)::numeric) >= 0.95 THEN 'EXCELLENT ✅'
        WHEN (heap_blks_hit::numeric / (heap_blks_read + heap_blks_hit)::numeric) >= 0.90 THEN 'GOOD 🟢'
        WHEN (heap_blks_hit::numeric / (heap_blks_read + heap_blks_hit)::numeric) >= 0.80 THEN 'FAIR 🟡'
        ELSE 'POOR 🔴'
    END as cache_performance
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'cart_items', 'products', 'product_variants', 'categories', 'profiles')
ORDER BY cache_hit_ratio ASC;

-- 5. Connection and Activity Analysis
SELECT 
    '=== CONNECTION & ACTIVITY ANALYSIS ===' as section,
    datname as database_name,
    numbackends as active_connections,
    xact_commit as transactions_committed,
    xact_rollback as transactions_rolled_back,
    blks_read as blocks_read,
    blks_hit as blocks_hit,
    tup_returned as tuples_returned,
    tup_fetched as tuples_fetched,
    tup_inserted as tuples_inserted,
    tup_updated as tuples_updated,
    tup_deleted as tuples_deleted,
    CASE 
        WHEN numbackends > 50 THEN 'HIGH CONNECTIONS 🔴'
        WHEN numbackends > 20 THEN 'MEDIUM CONNECTIONS 🟡'
        ELSE 'NORMAL CONNECTIONS 🟢'
    END as connection_status
FROM pg_stat_database 
WHERE datname = current_database();

-- 6. Performance Summary Report
SELECT 
    '=== PERFORMANCE OPTIMIZATION SUMMARY ===' as section,
    'Performance Verification Completed' as status,
    NOW() as verification_timestamp,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as total_performance_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' AND idx_scan > 0) as active_indexes,
    (SELECT ROUND(AVG(mean_time)::numeric, 2) FROM pg_stat_statements WHERE calls > 10) as avg_query_time_ms,
    (SELECT pg_size_pretty(SUM(pg_total_relation_size(schemaname::regclass, tablename::regclass))) 
     FROM pg_tables WHERE schemaname = 'public' 
       AND tablename IN ('orders', 'cart_items', 'products', 'product_variants', 'categories', 'profiles')) as total_table_size,
    'Run this verification after index creation and application usage' as recommendation;

-- 7. Recommendations based on current performance
SELECT 
    '=== PERFORMANCE RECOMMENDATIONS ===' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' AND idx_scan = 0) > 0 
        THEN 'Some indexes are unused - consider removing them' as recommendation_1
        ELSE 'All indexes are being used' as recommendation_1
    END,
    CASE 
        WHEN (SELECT AVG(mean_time) FROM pg_stat_statements WHERE calls > 10) > 200 
        THEN 'Some queries are still slow - consider further optimization' as recommendation_2
        ELSE 'Query performance is acceptable' as recommendation_2
    END,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables t JOIN pg_stat_user_tables s ON t.tablename = s.relname 
                     WHERE t.schemaname = 'public' AND s.schemaname = 'public' 
                       AND t.tablename IN ('orders', 'cart_items', 'products', 'product_variants', 'categories', 'profiles')
                       AND s.dead_rows > s.live_rows * 0.2)
        THEN 'Some tables have high bloat - consider VACUUM' as recommendation_3
        ELSE 'Table bloat is under control' as recommendation_3
    END,
    'Schedule regular performance monitoring' as recommendation_4;
`;

console.log('📊 Performance verification SQL generated');
console.log('\n' + '='.repeat(80));
console.log('COPY AND PASTE THE FOLLOWING INTO SUPABASE SQL EDITOR:');
console.log('='.repeat(80));
console.log(verificationSQL);
console.log('='.repeat(80));

// Save verification SQL to file
const verificationSQLFile = path.join(__dirname, 'verification.sql');
fs.writeFileSync(verificationSQLFile, verificationSQL);

// Create verification report template
const verificationReport = `
PERFORMANCE VERIFICATION REPORT
===============================
Date: ${new Date().toISOString()}

EXECUTION STEPS:
1. Copy the SQL above into Supabase SQL Editor
2. Run the verification queries
3. Save the results as: ${VERIFICATION_FILE}
4. Compare with baseline audit results

KEY METRICS TO MONITOR:
- Index usage counts (should increase over time)
- Query execution times (should decrease)
- Cache hit ratios (should improve)
- Table bloat percentages (should be < 20%)

PERFORMANCE TARGETS:
- Average query time: < 100ms
- Cache hit ratio: > 90%
- Index usage: > 80% of created indexes
- Table bloat: < 20%

NEXT STEPS:
1. Run verification queries
2. Document performance improvements
3. Schedule regular monitoring
4. Consider additional optimizations if needed
`;

fs.writeFileSync(path.join(RESULTS_DIR, 'verification-report.md'), verificationReport);
console.log('\n📋 Verification instructions saved to:', path.join(RESULTS_DIR, 'verification-report.md'));
console.log('📄 Verification SQL saved to:', verificationSQLFile);
console.log('\n✅ Performance verification script completed!');
console.log('🚀 Next step: Run the verification SQL in Supabase and compare results.');
