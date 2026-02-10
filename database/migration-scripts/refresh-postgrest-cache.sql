-- Refresh PostgREST Schema Cache
-- This forces PostgREST to recognize the new FK constraints

-- Option 1: Reload schema (recommended)
NOTIFY pgrst, 'reload schema';

-- Option 2: If above doesn't work, restart the connection
-- This may require restarting your Supabase connection

-- Verify PostgREST can see relationships
SELECT 
    tc.table_name, 
    tc.constraint_type,
    tc.constraint_name
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('production_batches', 'order_items', 'deliveries')
ORDER BY tc.table_name;
