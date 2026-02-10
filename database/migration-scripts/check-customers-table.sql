-- Check customers table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'customers'
ORDER BY ordinal_position;
