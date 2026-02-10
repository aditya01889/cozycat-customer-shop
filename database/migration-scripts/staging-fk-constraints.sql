-- Foreign Key Constraints Migration Script
-- Generated from Production Database Schema
-- Execute on Staging Database to fix operations page errors

-- Disable constraints temporarily for faster execution
SET session_replication_role = replica;

-- 1. products.category_id -> categories.id
ALTER TABLE "public"."products" 
ADD CONSTRAINT "products_category_id_fkey" 
FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");

-- 2. product_variants.product_id -> products.id
ALTER TABLE "public"."product_variants" 
ADD CONSTRAINT "product_variants_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;

-- 3. product_recipes.product_id -> products.id
ALTER TABLE "public"."product_recipes" 
ADD CONSTRAINT "product_recipes_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;

-- 4. product_recipes.ingredient_id -> ingredients.id
ALTER TABLE "public"."product_recipes" 
ADD CONSTRAINT "product_recipes_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 5. stock_transactions.ingredient_id -> ingredients.id
ALTER TABLE "public"."stock_transactions" 
ADD CONSTRAINT "stock_transactions_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 6. production_batches.product_id -> products.id
ALTER TABLE "public"."production_batches" 
ADD CONSTRAINT "production_batches_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

-- 7. batch_ingredients.batch_id -> production_batches.id
ALTER TABLE "public"."batch_ingredients" 
ADD CONSTRAINT "batch_ingredients_batch_id_fkey" 
FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id");

-- 8. batch_ingredients.ingredient_id -> ingredients.id
ALTER TABLE "public"."batch_ingredients" 
ADD CONSTRAINT "batch_ingredients_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 9. vendor_orders.vendor_id -> vendors.id
ALTER TABLE "public"."vendor_orders" 
ADD CONSTRAINT "vendor_orders_vendor_id_fkey" 
FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id");

-- 10. vendor_order_items.vendor_order_id -> vendor_orders.id
ALTER TABLE "public"."vendor_order_items" 
ADD CONSTRAINT "vendor_order_items_vendor_order_id_fkey" 
FOREIGN KEY ("vendor_order_id") REFERENCES "public"."vendor_orders"("id");

-- 11. vendor_order_items.ingredient_id -> ingredients.id
ALTER TABLE "public"."vendor_order_items" 
ADD CONSTRAINT "vendor_order_items_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 12. customers.profile_id -> profiles.id
ALTER TABLE "public"."customers" 
ADD CONSTRAINT "customers_profile_id_fkey" 
FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");

-- 13. customer_addresses.customer_id -> customers.id
ALTER TABLE "public"."customer_addresses" 
ADD CONSTRAINT "customer_addresses_customer_id_fkey" 
FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");

-- 14. orders.customer_id -> customers.id
ALTER TABLE "public"."orders" 
ADD CONSTRAINT "orders_customer_id_fkey" 
FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");

-- 15. orders.delivery_address_id -> customer_addresses.id
ALTER TABLE "public"."orders" 
ADD CONSTRAINT "orders_delivery_address_id_fkey" 
FOREIGN KEY ("delivery_address_id") REFERENCES "public"."customer_addresses"("id");

-- 16. order_items.order_id -> orders.id
ALTER TABLE "public"."order_items" 
ADD CONSTRAINT "order_items_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 17. order_items.product_variant_id -> product_variants.id
ALTER TABLE "public"."order_items" 
ADD CONSTRAINT "order_items_product_variant_id_fkey" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");

-- 18. deliveries.order_id -> orders.id
ALTER TABLE "public"."deliveries" 
ADD CONSTRAINT "deliveries_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 19. deliveries.delivery_partner_id -> delivery_partners.id
ALTER TABLE "public"."deliveries" 
ADD CONSTRAINT "deliveries_delivery_partner_id_fkey" 
FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."delivery_partners"("id");

-- 20. subscriptions.customer_id -> customers.id
ALTER TABLE "public"."subscriptions" 
ADD CONSTRAINT "subscriptions_customer_id_fkey" 
FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");

-- 21. subscriptions.product_variant_id -> product_variants.id
ALTER TABLE "public"."subscriptions" 
ADD CONSTRAINT "subscriptions_product_variant_id_fkey" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");

-- 22. notifications.user_id -> profiles.id
ALTER TABLE "public"."notifications" 
ADD CONSTRAINT "notifications_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

-- 23. communication_log.order_id -> orders.id
ALTER TABLE "public"."communication_log" 
ADD CONSTRAINT "communication_log_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 24. communication_log.customer_id -> customers.id
ALTER TABLE "public"."communication_log" 
ADD CONSTRAINT "communication_log_customer_id_fkey" 
FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");

-- 25. ingredient_updates.ingredient_id -> ingredients.id
ALTER TABLE "public"."ingredient_updates" 
ADD CONSTRAINT "ingredient_updates_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 26. ingredient_updates.previous_supplier -> vendors.id
ALTER TABLE "public"."ingredient_updates" 
ADD CONSTRAINT "ingredient_updates_previous_supplier_fkey" 
FOREIGN KEY ("previous_supplier") REFERENCES "public"."vendors"("id");

-- 27. ingredient_updates.new_supplier -> vendors.id
ALTER TABLE "public"."ingredient_updates" 
ADD CONSTRAINT "ingredient_updates_new_supplier_fkey" 
FOREIGN KEY ("new_supplier") REFERENCES "public"."vendors"("id");

-- 28. ingredients.supplier -> vendors.id
ALTER TABLE "public"."ingredients" 
ADD CONSTRAINT "ingredients_supplier_fkey" 
FOREIGN KEY ("supplier") REFERENCES "public"."vendors"("id");

-- 29. purchase_order_items.purchase_order_id -> purchase_orders.id
ALTER TABLE "public"."purchase_order_items" 
ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" 
FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id");

-- 30. low_stock_alerts.purchase_order_id -> purchase_orders.id
ALTER TABLE "public"."low_stock_alerts" 
ADD CONSTRAINT "low_stock_alerts_purchase_order_id_fkey" 
FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id");

-- 31. production_batch_items.batch_id -> production_batches.id
ALTER TABLE "public"."production_batch_items" 
ADD CONSTRAINT "production_batch_items_batch_id_fkey" 
FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id");

-- 32. production_batch_items.order_id -> orders.id
ALTER TABLE "public"."production_batch_items" 
ADD CONSTRAINT "production_batch_items_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 33. production_batch_items.order_item_id -> order_items.id
ALTER TABLE "public"."production_batch_items" 
ADD CONSTRAINT "production_batch_items_order_item_id_fkey" 
FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id");

-- 34. production_batch_items.product_id -> products.id
ALTER TABLE "public"."production_batch_items" 
ADD CONSTRAINT "production_batch_items_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

-- 35. production_batches.order_id -> orders.id
ALTER TABLE "public"."production_batches" 
ADD CONSTRAINT "production_batches_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 36. batch_orders.batch_id -> production_batches.id
ALTER TABLE "public"."batch_orders" 
ADD CONSTRAINT "batch_orders_batch_id_fkey" 
FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id");

-- 37. batch_orders.order_id -> orders.id
ALTER TABLE "public"."batch_orders" 
ADD CONSTRAINT "batch_orders_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 38. batch_order_items.batch_id -> production_batches.id
ALTER TABLE "public"."batch_order_items" 
ADD CONSTRAINT "batch_order_items_batch_id_fkey" 
FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id");

-- 39. batch_order_items.order_id -> orders.id
ALTER TABLE "public"."batch_order_items" 
ADD CONSTRAINT "batch_order_items_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");

-- 40. batch_order_items.order_item_id -> order_items.id
ALTER TABLE "public"."batch_order_items" 
ADD CONSTRAINT "batch_order_items_order_item_id_fkey" 
FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id");

-- 41. ingredient_unit_conversions.ingredient_id -> ingredients.id
ALTER TABLE "public"."ingredient_unit_conversions" 
ADD CONSTRAINT "ingredient_unit_conversions_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");

-- 42. packaging_materials.supplier -> vendors.id
ALTER TABLE "public"."packaging_materials" 
ADD CONSTRAINT "packaging_materials_supplier_fkey" 
FOREIGN KEY ("supplier") REFERENCES "public"."vendors"("id");

-- Re-enable constraints
SET session_replication_role = DEFAULT;

-- Verify constraints were added
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
ORDER BY tc.table_name, kcu.column_name;
