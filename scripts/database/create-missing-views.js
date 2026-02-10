const { createClient } = require('@supabase/supabase-js');

const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createMissingViews() {
  console.log('🔧 Creating missing views in staging...');
  
  // 1. Create order_lifecycle_view (exact production schema)
  try {
    const { error: viewError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (viewError) {
      console.error('❌ Error creating order_lifecycle_view:', viewError);
    } else {
      console.log('✅ order_lifecycle_view created');
    }
  } catch (e) {
    console.error('❌ Exception creating order_lifecycle_view:', e);
  }
  
  // 2. Check if production_batches table exists (needed for the view)
  try {
    const { data, error } = await stagingSupabase
      .from('production_batches')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('Could not find the table')) {
      console.log('❌ production_batches table missing - creating it...');
      
      // Create production_batches table
      const { error: createError } = await stagingSupabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."production_batches" (
              "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
              "batch_number" "text" NOT NULL,
              "order_id" "uuid",
              "product_id" "uuid",
              "batch_type" "text" DEFAULT 'individual'::"text",
              "status" "text" DEFAULT 'planned'::"text",
              "total_orders" "integer" DEFAULT 1,
              "total_quantity_produced" "integer",
              "quantity_produced" "integer",
              "total_weight_grams" "integer",
              "waste_factor" "numeric" DEFAULT 7.5,
              "planned_date" "timestamp with time zone",
              "actual_production_date" "timestamp with time zone",
              "start_time" "timestamp with time zone",
              "end_time" "timestamp with time zone",
              "priority" "integer" DEFAULT 5,
              "delivery_created" "boolean" DEFAULT false,
              "notes" "text",
              "created_by" "uuid",
              "created_at" "timestamp with time zone" DEFAULT "now"(),
              "updated_at" "timestamp with time zone" DEFAULT "now"()"
          );
          
          CREATE INDEX IF NOT EXISTS idx_production_batches_order_id ON public.production_batches(order_id);
          CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches(status);
          CREATE INDEX IF NOT EXISTS idx_production_batches_batch_type ON public.production_batches(batch_type);
        `
      });
      
      if (createError) {
        console.error('❌ Error creating production_batches table:', createError);
      } else {
        console.log('✅ production_batches table created');
      }
    } else {
      console.log('✅ production_batches table exists');
    }
  } catch (e) {
    console.error('❌ Exception checking production_batches:', e);
  }
  
  // 3. Check if deliveries table exists (needed for the view)
  try {
    const { data, error } = await stagingSupabase
      .from('deliveries')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('Could not find the table')) {
      console.log('❌ deliveries table missing - creating it...');
      
      // Create deliveries table
      const { error: createError } = await stagingSupabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."deliveries" (
              "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
              "delivery_number" "text" NOT NULL,
              "order_id" "uuid",
              "batch_id" "uuid",
              "delivery_partner_id" "uuid",
              "status" "text" DEFAULT 'pending'::"text",
              "pickup_time" "timestamp with time zone",
              "delivered_time" "timestamp with time zone",
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
              "created_at" "timestamp with time zone" DEFAULT "now"(),
              "updated_at" "timestamp with time zone" DEFAULT "now"()
          );
          
          CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
          CREATE INDEX IF NOT EXISTS idx_deliveries_batch_id ON public.deliveries(batch_id);
          CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
        `
      });
      
      if (createError) {
        console.error('❌ Error creating deliveries table:', createError);
      } else {
        console.log('✅ deliveries table created');
      }
    } else {
      console.log('✅ deliveries table exists');
    }
  } catch (e) {
    console.error('❌ Exception checking deliveries:', e);
  }
  
  console.log('🎉 Missing views/tables creation completed');
  
  // Verify the view was created
  console.log('\n🔍 Verifying order_lifecycle_view...');
  try {
    const { data, error } = await stagingSupabase
      .from('order_lifecycle_view')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ order_lifecycle_view:', error.message);
    } else {
      console.log('✅ order_lifecycle_view exists and accessible');
    }
  } catch (e) {
    console.log('❌ Exception verifying view:', e);
  }
}

// Also generate SQL file for manual execution
function generateViewsSQL() {
  const sql = `
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
    "total_orders" "integer" DEFAULT 1,
    "total_quantity_produced" "integer",
    "quantity_produced" "integer",
    "total_weight_grams" "integer",
    "waste_factor" "numeric" DEFAULT 7.5,
    "planned_date" "timestamp with time zone",
    "actual_production_date" "timestamp with time zone",
    "start_time" "timestamp with time zone",
    "end_time" "timestamp with time zone",
    "priority" "integer" DEFAULT 5,
    "delivery_created" "boolean" DEFAULT false,
    "notes" "text",
    "created_by" "uuid",
    "created_at" "timestamp with time zone" DEFAULT "now"(),
    "updated_at" "timestamp with time zone" DEFAULT "now"()
);

-- Create deliveries table (needed for order_lifecycle_view)
CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "delivery_number" "text" NOT NULL,
    "order_id" "uuid",
    "batch_id" "uuid",
    "delivery_partner_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "pickup_time" "timestamp with time zone",
    "delivered_time" "timestamp with time zone",
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
    "created_at" "timestamp with time zone" DEFAULT "now"(),
    "updated_at" "timestamp with time zone" DEFAULT "now"()
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
  `;

  require('fs').writeFileSync('create-staging-views.sql', sql);
  console.log('📄 SQL file created: create-staging-views.sql');
  console.log('🔗 Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql');
}

// Run both approaches
createMissingViews();
generateViewsSQL();
