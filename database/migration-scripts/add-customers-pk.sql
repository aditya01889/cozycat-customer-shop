-- Add primary key to customers table
ALTER TABLE "public"."customers" 
ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");

-- Verify primary key was added
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'customers';
