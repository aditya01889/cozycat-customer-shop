const { createClient } = require('@supabase/supabase-js');

const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createMissingTables() {
  console.log('🔧 Creating missing tables in staging based on production schema...');
  
  // 1. Create customer_addresses table (exact production schema)
  try {
    const { error: addressesError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON public.customer_addresses(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON public.customer_addresses(is_default);
      `
    });
    
    if (addressesError) {
      console.error('❌ Error creating customer_addresses table:', addressesError);
    } else {
      console.log('✅ customer_addresses table created');
    }
  } catch (e) {
    console.error('❌ Exception creating customer_addresses table:', e);
  }
  
  // 2. Create customers table (exact production schema)
  try {
    const { error: customersError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS "public"."customers" (
            "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
            "profile_id" "uuid",
            "phone" "text" NOT NULL,
            "whatsapp_number" "text",
            "is_active" boolean DEFAULT true,
            "created_at" timestamp with time zone DEFAULT "now"(),
            "updated_at" timestamp with time zone DEFAULT "now"()
        );
        
        CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON public.customers(profile_id);
        CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
      `
    });
    
    if (customersError) {
      console.error('❌ Error creating customers table:', customersError);
    } else {
      console.log('✅ customers table created');
    }
  } catch (e) {
    console.error('❌ Exception creating customers table:', e);
  }
  
  // 3. Create ingredients table (exact production schema)
  try {
    const { error: ingredientsError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients(name);
        CREATE INDEX IF NOT EXISTS idx_ingredients_supplier ON public.ingredients(supplier);
      `
    });
    
    if (ingredientsError) {
      console.error('❌ Error creating ingredients table:', ingredientsError);
    } else {
      console.log('✅ ingredients table created');
    }
  } catch (e) {
    console.error('❌ Exception creating ingredients table:', e);
  }
  
  // 4. Create vendors table (exact production schema)
  try {
    const { error: vendorsError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);
        CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);
      `
    });
    
    if (vendorsError) {
      console.error('❌ Error creating vendors table:', vendorsError);
    } else {
      console.log('✅ vendors table created');
    }
  } catch (e) {
    console.error('❌ Exception creating vendors table:', e);
  }
  
  // 5. Create basic settings table (not found in production, but commonly needed)
  try {
    const { error: settingsError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (settingsError) {
      console.error('❌ Error creating settings table:', settingsError);
    } else {
      console.log('✅ settings table created');
    }
  } catch (e) {
    console.error('❌ Exception creating settings table:', e);
  }
  
  console.log('🎉 Missing tables creation completed');
  
  // Verify the tables were created
  console.log('\n🔍 Verifying created tables...');
  const tables = ['customer_addresses', 'customers', 'ingredients', 'vendors', 'settings'];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await stagingSupabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌', tableName, ':', error.message);
      } else {
        console.log('✅', tableName, ': exists and accessible');
      }
    } catch (e) {
      console.log('❌', tableName, ': error accessing');
    }
  }
}

// Run the table creation
createMissingTables();
