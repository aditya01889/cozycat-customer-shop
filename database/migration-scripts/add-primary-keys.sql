-- Add Missing Primary Keys First
-- These tables exist but lack primary key constraints
-- FK constraints require referenced tables to have primary keys

-- 1. Add primary key to ingredients table (CRITICAL - blocks many FK constraints)
ALTER TABLE "public"."ingredients" 
ADD CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id");

-- 2. Add primary key to vendors table
ALTER TABLE "public"."vendors" 
ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");

-- 3. Add primary key to deliveries table
ALTER TABLE "public"."deliveries" 
ADD CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id");

-- 4. Add primary key to production_batches table
ALTER TABLE "public"."production_batches" 
ADD CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id");

-- Verify primary keys were added
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('ingredients', 'vendors', 'deliveries', 'production_batches')
ORDER BY tc.table_name;
