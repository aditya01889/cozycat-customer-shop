-- Check orders table structure for delivery_address_id column
SELECT 
    column_name,
    data_type,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'orders'
    AND column_name = 'delivery_address_id'
ORDER BY ordinal_position;
