-- Final Foreign Key Constraints (Fixed Data Type Issues)
-- Skip incompatible constraints, focus on critical operations page fixes

-- Disable constraints temporarily for faster execution
SET session_replication_role = replica;

-- 1. product_recipes.product_id -> products.id (MISSING)
ALTER TABLE "public"."product_recipes" 
ADD CONSTRAINT "product_recipes_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;

-- 2. product_recipes.ingredient_id -> ingredients.id (MISSING)
ALTER TABLE "public"."product_recipes" 
ADD CONSTRAINT "product_recipes_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 3. production_batches.product_id -> products.id (MISSING - CRITICAL FOR OPERATIONS PAGE)
ALTER TABLE "public"."production_batches" 
ADD CONSTRAINT "production_batches_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

-- 4. production_batches.order_id -> orders.id (MISSING - CRITICAL FOR OPERATIONS PAGE)
ALTER TABLE "public"."production_batches" 
ADD CONSTRAINT "production_batches_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 5. customers.profile_id -> profiles.id (MISSING)
ALTER TABLE "public"."customers" 
ADD CONSTRAINT "customers_profile_id_fkey" 
FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");

-- 6. deliveries.order_id -> orders.id (MISSING - CRITICAL FOR OPERATIONS PAGE)
ALTER TABLE "public"."deliveries" 
ADD CONSTRAINT "deliveries_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 7. deliveries.delivery_partner_id -> delivery_partners.id (MISSING - CRITICAL FOR OPERATIONS PAGE)
ALTER TABLE "public"."deliveries" 
ADD CONSTRAINT "deliveries_delivery_partner_id_fkey" 
FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."delivery_partners"("id");

-- 8. ingredients.supplier -> vendors.id (MISSING)
ALTER TABLE "public"."ingredients" 
ADD CONSTRAINT "ingredients_supplier_fkey" 
FOREIGN KEY ("supplier") REFERENCES "public"."vendors"("id");

-- SKIPPED: orders.delivery_address_id -> customer_addresses.id (INCOMPATIBLE TYPES: text vs uuid)

-- Re-enable constraints
SET session_replication_role = DEFAULT;

-- Verify critical constraints were added
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.constraint_name IN (
        'production_batches_product_id_fkey',
        'production_batches_order_id_fkey',
        'deliveries_order_id_fkey',
        'deliveries_delivery_partner_id_fkey'
    )
ORDER BY tc.table_name, kcu.column_name;
