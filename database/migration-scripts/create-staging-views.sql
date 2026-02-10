
-- =====================================================
-- CREATE MISSING VIEWS AND TABLES IN STAGING
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Create production_batches table (needed for order_lifecycle_view)
CREATE TABLE IF NOT EXISTS "public"."production_batches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "batch_number" "text" NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "batch_type" "text" DEFAULT 'individual'::"text",
    "status" "text" DEFAULT 'planned'::"text",
    "total_orders" INTEGER DEFAULT 1,
    "total_quantity_produced" INTEGER,
    "quantity_produced" INTEGER,
    "total_weight_grams" INTEGER,
    "waste_factor" NUMERIC DEFAULT 7.5,
    "planned_date" TIMESTAMP WITH TIME ZONE,
    "actual_production_date" TIMESTAMP WITH TIME ZONE,
    "start_time" TIMESTAMP WITH TIME ZONE,
    "end_time" TIMESTAMP WITH TIME ZONE,
    "priority" INTEGER DEFAULT 5,
    "delivery_created" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table (needed for order_lifecycle_view)
CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "delivery_number" "text" NOT NULL,
    "order_id" "uuid",
    "batch_id" "uuid",
    "delivery_partner_id" "uuid",
    "status" TEXT DEFAULT 'pending',
    "pickup_time" TIMESTAMP WITH TIME ZONE,
    "delivered_time" TIMESTAMP WITH TIME ZONE,
    "estimated_delivery_date" TIMESTAMP WITH TIME ZONE,
    "actual_delivery_date" TIMESTAMP WITH TIME ZONE,
    "tracking_number" TEXT,
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "delivery_address" TEXT,
    "delivery_partner_name" TEXT,
    "delivery_partner_phone" TEXT,
    "items_count" INTEGER,
    "total_value" NUMERIC(10,2),
    "delivery_status" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_lifecycle_view (exact production schema)
CREATE OR REPLACE VIEW "public"."order_lifecycle_view" AS
SELECT DISTINCT ON ("o"."id") "o"."id",
    "o"."order_number",
    "o"."status" AS "order_status",
    "o"."customer_id",
    "o"."total_amount",
    "o"."created_at" AS "order_created_at",
    "o"."updated_at" AS "order_updated_at",
    "pb"."id" AS "production_batch_id",
    "pb"."status" AS "production_status",
    "pb"."created_at" AS "production_created_at",
    "pb"."updated_at" AS "production_updated_at",
    "d"."id" AS "delivery_id",
    "d"."status" AS "delivery_status",
    "d"."delivery_number",
    "d"."created_at" AS "delivery_created_at",
    "d"."updated_at" AS "delivery_updated_at",
    COALESCE("p"."full_name", 'Unknown Customer') AS "customer_name",
    "p"."email" AS "customer_email",
        CASE
            WHEN ("o"."status" = 'pending') THEN 'Order Placed'
            WHEN ("o"."status" = 'confirmed') THEN 'Order Confirmed'
            WHEN ("o"."status" = 'ready_production') THEN 'Preparing Your Order'
            WHEN ("o"."status" = 'in_production') THEN 'Preparing Your Order'
            WHEN ("o"."status" = 'ready_delivery') THEN 'Ready for Dispatch'
            WHEN ("o"."status" = 'out_for_delivery') THEN 'Out for Delivery'
            WHEN ("o"."status" = 'delivered') THEN 'Delivered'
            WHEN ("o"."status" = 'cancelled') THEN 'Cancelled'
            ELSE "o"."status"
        END AS "customer_status",
    GREATEST("o"."updated_at", COALESCE("pb"."updated_at", "o"."updated_at"), COALESCE("d"."updated_at", "o"."updated_at")) AS "last_activity_at"
   FROM ("public"."orders" "o"
     LEFT JOIN "public"."profiles" "p" ON (("o"."customer_id" = "p"."id")))
     LEFT JOIN LATERAL ( SELECT "production_batches"."id",
            "production_batches"."batch_number",
            "production_batches"."product_id",
            "production_batches"."quantity_produced",
            "production_batches"."status",
            "production_batches"."planned_date",
            "production_batches"."actual_production_date",
            "production_batches"."notes",
            "production_batches"."created_at",
            "production_batches"."updated_at",
            "production_batches"."order_id",
            "production_batches"."created_by",
            "production_batches"."start_time",
            "production_batches"."end_time",
            "production_batches"."priority",
            "production_batches"."delivery_created",
            "production_batches"."batch_type",
            "production_batches"."total_orders",
            "production_batches"."total_quantity_produced",
            "production_batches"."waste_factor",
            "production_batches"."total_weight_grams"
           FROM "public"."production_batches"
          WHERE ("production_batches"."order_id" = "o"."id")
          ORDER BY "production_batches"."updated_at" DESC
         LIMIT 1) "pb" ON (true))
     LEFT JOIN LATERAL ( SELECT "deliveries"."id",
            "deliveries"."order_id",
            "deliveries"."delivery_partner_id",
            "deliveries"."pickup_time",
            "deliveries"."delivered_time",
            "deliveries"."status",
            "deliveries"."notes",
            "deliveries"."created_at",
            "deliveries"."updated_at",
            "deliveries"."delivery_number",
            "deliveries"."batch_id",
            "deliveries"."customer_name",
            "deliveries"."customer_email",
            "deliveries"."customer_phone",
            "deliveries"."delivery_address",
            "deliveries"."delivery_partner_name",
            "deliveries"."delivery_partner_phone",
            "deliveries"."estimated_delivery_date",
            "deliveries"."actual_delivery_date",
            "deliveries"."tracking_number",
            "deliveries"."items_count",
            "deliveries"."total_value",
            "deliveries"."delivery_status"
           FROM "public"."deliveries"
          WHERE ("deliveries"."order_id" = "o"."id")
          ORDER BY "deliveries"."updated_at" DESC
         LIMIT 1) "d" ON (true))
  ORDER BY "o"."id", "o"."created_at" DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_production_batches_order_id ON public.production_batches(order_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_batch_type ON public.production_batches(batch_type);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_batch_id ON public.deliveries(batch_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

-- Verify view was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('order_lifecycle_view', 'production_batches', 'deliveries')
ORDER BY table_name;
  