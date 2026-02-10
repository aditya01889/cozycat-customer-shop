-- Clean orphaned customer_addresses records
-- Remove records that reference non-existent customers

-- Check orphaned customer_addresses records
SELECT 
    'customer_addresses' as table_name,
    COUNT(*) as orphaned_count,
    'customer_id' as orphaned_field
FROM customer_addresses ca
LEFT JOIN customers c ON ca.customer_id = c.id
WHERE c.id IS NULL;

-- Clean orphaned records
DELETE FROM customer_addresses 
WHERE customer_id NOT IN (SELECT id FROM customers);

-- Verify cleanup
SELECT 'Cleanup Complete - Verification:' as status;
SELECT COUNT(*) as remaining_customer_addresses FROM customer_addresses;
