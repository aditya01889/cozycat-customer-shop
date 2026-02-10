-- Add Remaining Missing Primary Keys
-- These tables exist but lack primary key constraints

-- 1. Add primary key to customer_addresses table
ALTER TABLE "public"."customer_addresses" 
ADD CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id");

-- 2. Add primary key to product_recipes table
ALTER TABLE "public"."product_recipes" 
ADD CONSTRAINT "product_recipes_pkey" PRIMARY KEY ("id");

-- Verify primary keys were added
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('customer_addresses', 'product_recipes')
ORDER BY tc.table_name;
