/**
 * Fix RLS Issues - Enable RLS on tables and create policies
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLS() {
  console.log('🔧 Fixing RLS Issues...')
  
  try {
    // First, let's check what tables exist
    console.log('\n📋 Checking existing tables...')
    
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'customers', 'orders', 'addresses', 'products'])
    
    console.log('Existing tables:')
    existingTables?.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    
    // Enable RLS on each table
    console.log('\n📋 Enabling RLS on tables...')
    
    for (const table of existingTables || []) {
      console.log(`  - Enabling RLS on ${table.table_name}...`)
      
      const { error: enableError } = await supabase.rpc('sql', {
        sql: `ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;`
      })
      
      if (enableError) {
        console.log(`    ❌ Error: ${enableError.message}`)
      } else {
        console.log(`    ✅ RLS enabled`)
      }
    }
    
    // Create policies for each table
    console.log('\n📋 Creating RLS policies...')
    
    // Profiles policies
    console.log('  - Creating profiles policies...')
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Admins can manage all profiles" ON profiles
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    })
    
    // Customers policies
    console.log('  - Creating customers policies...')
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can view own customer data" ON customers
          FOR SELECT USING (auth.uid() = profile_id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can update own customer data" ON customers
          FOR UPDATE USING (auth.uid() = profile_id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Admins can view all customers" ON customers
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    })
    
    // Orders policies
    console.log('  - Creating orders policies...')
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can view own orders" ON orders
          FOR SELECT USING (auth.uid() = customer_id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can create own orders" ON orders
          FOR INSERT WITH CHECK (auth.uid() = customer_id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Admins can view all orders" ON orders
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    })
    
    // Addresses policies
    console.log('  - Creating addresses policies...')
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can view own addresses" ON addresses
          FOR SELECT USING (auth.uid() = customer_id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can manage own addresses" ON addresses
          FOR ALL USING (auth.uid() = customer_id);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Admins can view all addresses" ON addresses
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    })
    
    // Products policies
    console.log('  - Creating products policies...')
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Public can view active products" ON products
          FOR SELECT USING (is_active = true);
      `
    })
    
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Admins can manage all products" ON products
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    })
    
    console.log('\n✅ RLS Policies created successfully!')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error fixing RLS:', error)
    return { success: false, error: error.message }
  }
}

fixRLS()
