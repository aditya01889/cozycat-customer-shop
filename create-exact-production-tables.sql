-- =====================================================
-- CREATE EXACT PRODUCTION TABLES IN STAGING
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Step 1: Create products table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "short_description" "text",
    "nutritional_info" "jsonb",
    "ingredients_display" "text",
    "image_url" "text",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "packaging_type" "text",
    "label_type" "text",
    "packaging_quantity_per_product" integer DEFAULT 1,
    "label_quantity_per_product" integer DEFAULT 1
);

-- Step 2: Create ingredients table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."ingredients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "unit" "text" NOT NULL,
    "current_stock" numeric(12,3) DEFAULT 0,
    "reorder_level" numeric(12,3) DEFAULT 0,
    "unit_cost" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "supplier" "uuid",
    CONSTRAINT "check_supplier_uuid" CHECK ((("supplier" IS NULL) OR (("supplier")::"text" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::"text")))
);

-- Step 3: Create product_recipes table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."product_recipes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "ingredient_id" "uuid",
    "percentage" numeric(5,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Step 4: Create production_batches table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."production_batches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "batch_number" "text" NOT NULL,
    "product_id" "uuid",
    "quantity_produced" integer NOT NULL,
    "status" "text" NOT NULL,
    "planned_date" "date",
    "actual_production_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "order_id" "uuid",
    "created_by" "uuid",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "priority" integer DEFAULT 1,
    "delivery_created" boolean DEFAULT false,
    "batch_type" "text" DEFAULT 'single'::"text",
    "total_orders" integer DEFAULT 1,
    "total_quantity_produced" integer DEFAULT 0,
    "waste_factor" numeric(5,2) DEFAULT 7.5,
    "total_weight_grams" numeric(10,2),
    CONSTRAINT "production_batches_batch_type_check" CHECK (("batch_type" = ANY (ARRAY['single'::"text", 'group'::"text"]))),
    CONSTRAINT "production_batches_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 5))),
    CONSTRAINT "production_batches_status_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"])))
);

-- Step 5: Create deliveries table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "delivery_number" "text" NOT NULL,
    "order_id" "uuid",
    "batch_id" "uuid",
    "delivery_partner_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "pickup_time" timestamp with time zone,
    "delivered_time" timestamp with time zone,
    "estimated_delivery_date" "timestamp with time zone",
    "actual_delivery_date" "timestamp with time zone",
    "tracking_number" "text",
    "customer_name" "text",
    "customer_email" "text",
    "customer_phone" "text",
    "delivery_address" "text",
    "delivery_partner_name" "text",
    "delivery_partner_phone" "text",
    "items_count" "integer",
    "total_value" "numeric"(10,2),
    "delivery_status" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Step 6: Create delivery_partners table (exact production schema)
CREATE TABLE IF NOT EXISTS "public"."delivery_partners" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_phone" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Step 7: Create order_lifecycle_view (exact production schema)
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
    COALESCE("p"."full_name", 'Unknown Customer'::"text") AS "customer_name",
    "p"."email" AS "customer_email",
        CASE
            WHEN ("o"."status" = 'pending'::"text") THEN 'Order Placed'::"text"
            WHEN ("o"."status" = 'confirmed'::"text") THEN 'Order Confirmed'::"text"
            WHEN ("o"."status" = 'ready_production'::"text") THEN 'Preparing Your Order'::"text"
            WHEN ("o"."status" = 'in_production'::"text") THEN 'Preparing Your Order'::"text"
            WHEN ("o"."status" = 'ready_delivery'::"text") THEN 'Ready for Dispatch'::"text"
            WHEN ("o"."status" = 'out_for_delivery'::"text") THEN 'Out for Delivery'::"text"
            WHEN ("o"."status" = 'delivered'::"text") THEN 'Delivered'::"text"
            WHEN ("o"."status" = 'cancelled'::"text") THEN 'Cancelled'::"text"
            ELSE "o"."status"
        END AS "customer_status",
    GREATEST("o"."updated_at", COALESCE("pb"."updated_at", "o"."updated_at"), COALESCE("d"."updated_at", "o"."updated_at")) AS "last_activity_at"
   FROM ((("public"."orders" "o"
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

-- Step 8: Verify all tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'ingredients', 'product_recipes', 'production_batches', 'deliveries', 'delivery_partners', 'order_lifecycle_view')
ORDER BY table_name;
