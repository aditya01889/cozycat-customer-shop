-- Security Audit Script for Supabase Database
-- Run this in Supabase SQL Editor to check RLS status

-- Step 1: Check RLS status on all tables
SELECT 
  '=== RLS STATUS REPORT ===' as section,
  '' as blank1,
  'Table' as table_type,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 2: Check existing RLS policies
SELECT 
  '=== RLS POLICIES REPORT ===' as section,
  '' as blank1,
  'Policy' as table_type,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  CASE 
    WHEN permissive THEN 'PERMISSIVE ✅'
    ELSE 'RESTRICTIVE 🔒'
  END as policy_type
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Step 3: Check table sizes and access patterns
SELECT 
  '=== TABLE SECURITY ANALYSIS ===' as section,
  '' as blank1,
  'Security' as table_type,
  t.table_name,
  pg_size_pretty(t.table_oid) as table_size,
  COALESCE(s.n_tup_ins, 0) as inserts,
  COALESCE(s.n_tup_upd, 0) as updates,
  COALESCE(s.n_tup_del, 0) as deletes,
  CASE 
    WHEN t.table_name IN ('users', 'orders', 'cart_items') THEN 'HIGH RISK 🔴'
    WHEN t.table_name LIKE '%user%' OR t.table_name LIKE '%order%' OR t.table_name LIKE '%payment%' THEN 'MEDIUM RISK 🟡'
    ELSE 'LOW RISK 🟢'
  END as risk_level
FROM information_schema.tables t
LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY pg_size_pretty(t.table_oid) DESC;

-- Step 4: Check for public access
SELECT 
  '=== PUBLIC ACCESS REPORT ===' as section,
  '' as blank1,
  'Access' as table_type,
  schemaname,
  tablename,
  hascolumnprivileges as column_privileges,
  hasinsertprivilege as insert_privilege,
  hasupdateprivilege as update_privilege,
  hasdeleteprivilege as delete_privilege,
  hasselprivileges as select_privilege,
  CASE 
    WHEN hasinsertprivilege AND hasupdateprivilege AND hasdeleteprivilege THEN 'FULL ACCESS 🔴'
    WHEN hasinsertprivilege OR hasupdateprivilege OR hasdeleteprivilege THEN 'PARTIAL ACCESS 🟡'
    WHEN hasselprivileges THEN 'READ-ONLY ACCESS 🟡'
    ELSE 'MINIMAL ACCESS 🟢'
  END as access_level
FROM information_schema.role_table_grants 
WHERE grantee = 'PUBLIC'
  AND schemaname = 'public'
ORDER BY access_level DESC, tablename;

-- Step 5: Check for authentication bypass risks
SELECT 
  '=== AUTHENTICATION RISKS ===' as section,
  '' as blank1,
  'Risk' as table_type,
  tablename,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE schemaname = 'public'
  AND (
    column_name LIKE '%password%' 
    OR column_name LIKE '%token%' 
    OR column_name LIKE '%secret%' 
    OR column_name LIKE '%key%'
  )
ORDER BY tablename, column_name;
