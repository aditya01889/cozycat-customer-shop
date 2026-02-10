const { createClient } = require('@supabase/supabase-js');

const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createTablesWithDirectSQL() {
  console.log('🔧 Creating missing tables using direct SQL...');
  
  // Since we can't use exec_sql, let's create the tables by trying to insert data
  // This will trigger table creation if we use the right approach
  
  const tables = [
    {
      name: 'customer_addresses',
      sampleData: {
        id: '00000000-0000-0000-0000-000000000001',
        customer_id: '00000000-0000-0000-0000-000000000001',
        label: 'Home',
        address_line1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        is_default: false
      }
    },
    {
      name: 'customers',
      sampleData: {
        id: '00000000-0000-0000-0000-000000000001',
        profile_id: '00000000-0000-0000-0000-000000000001',
        phone: '1234567890',
        is_active: true
      }
    },
    {
      name: 'ingredients',
      sampleData: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Ingredient',
        unit: 'kg',
        current_stock: 0,
        reorder_level: 0,
        unit_cost: 100.00
      }
    },
    {
      name: 'vendors',
      sampleData: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Vendor',
        phone: '1234567890',
        is_active: true
      }
    },
    {
      name: 'settings',
      sampleData: {
        key: 'test_setting',
        value: 'test_value',
        description: 'Test setting',
        is_public: false
      }
    }
  ];
  
  for (const table of tables) {
    console.log(`\n🔍 Creating table: ${table.name}`);
    
    try {
      // Try to insert sample data - this will fail if table doesn't exist
      const { data, error } = await stagingSupabase
        .from(table.name)
        .insert([table.sampleData])
        .select();
      
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('Could not find the table')) {
          console.log(`❌ Table ${table.name} does not exist and cannot be created via INSERT`);
        } else {
          console.log(`⚠️  Table ${table.name} might exist but insert failed:`, error.message);
        }
      } else {
        console.log(`✅ Table ${table.name} exists and sample data inserted`);
        
        // Clean up the test data
        await stagingSupabase
          .from(table.name)
          .delete()
          .eq('id', table.sampleData.id);
        
        console.log(`🧹 Cleaned up sample data from ${table.name}`);
      }
    } catch (e) {
      console.log(`❌ Exception with ${table.name}:`, e.message);
    }
  }
  
  console.log('\n🎉 Table creation process completed');
  console.log('\n📝 NOTE: Some tables may need to be created manually in the Supabase dashboard');
  console.log('🔗 https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql');
}

// Alternative: Create SQL file for manual execution
function generateSQLFile() {
  const sql = `
-- =====================================================
-- CREATE MISSING TABLES IN STAGING
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Create customer_addresses table
CREATE TABLE IF NOT EXISTS "public"."customer_addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "label" "text",
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "landmark" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "pincode" "text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "delivery_notes" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "phone" "text" NOT NULL,
    "whatsapp_number" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Create ingredients table
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
    CONSTRAINT "check_supplier_uuid" CHECK ((("supplier" IS NULL) OR (("supplier")::"text" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::"text")))
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_person" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "payment_terms" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS "public"."settings" (
    "key" "text" PRIMARY KEY,
    "value" "text",
    "description" "text",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Insert basic settings
INSERT INTO public.settings (key, value, description, is_public) VALUES
('site_name', 'CozyCat Kitchen', 'Site name', true),
('site_description', 'Premium cat food and treats', 'Site description', true),
('contact_email', 'support@cozycatkitchen.com', 'Contact email', true),
('contact_phone', '+91 98765 43210', 'Contact phone', true)
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON public.customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON public.customer_addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON public.customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_supplier ON public.ingredients(supplier);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customer_addresses', 'customers', 'ingredients', 'vendors', 'settings')
ORDER BY table_name;
`;

  require('fs').writeFileSync('create-staging-tables.sql', sql);
  console.log('📄 SQL file created: create-staging-tables.sql');
  console.log('🔗 Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql');
}

// Run both approaches
createTablesWithDirectSQL();
generateSQLFile();
