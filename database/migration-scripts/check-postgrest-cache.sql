-- Check PostgREST cache and configuration issues
-- This might reveal why PostgREST still sees old relationships

-- 1. Force PostgREST to reload schema completely
NOTIFY pgrst, 'reload schema';

-- 2. Check if there are any pending notifications
SELECT 
    pid,
    channel,
    payload,
    received
FROM pg_listening_channels()
WHERE channel = 'pgrst';

-- 3. Check PostgREST's internal schema cache (if accessible)
SELECT 
    current_database(),
    current_schema(),
    current_user;

-- 4. Check for any stuck transactions that might affect PostgREST
SELECT 
    pid,
    state,
    query_start,
    state_change,
    wait_event_type,
    wait_event
FROM pg_stat_activity 
WHERE state != 'idle'
    AND query ILIKE '%product_variants%'
ORDER BY query_start;
