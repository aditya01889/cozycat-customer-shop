/**
 * Apply RLS Policies to Supabase Database
 * This script will apply Row Level Security policies to secure the database
 */

const { createClient } = require('@supabase/supabase-js')

// Use service role key for admin operations
const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSPolicies() {
  console.log('🔒 Applying RLS Policies to Supabase Database...')
  
  try {
    // Enable RLS on all tables
    console.log('📋 Enabling RLS on tables...')
    
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can view own customer data" ON customers;
        DROP POLICY IF EXISTS "Users can update own customer data" ON customers;
        DROP POLICY IF EXISTS "Users can view own orders" ON orders;
        DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
        DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
        DROP POLICY IF EXISTS "Public can view active products" ON products;
        DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
        DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
        DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
        DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
        DROP POLICY IF EXISTS "Admins can manage all products" ON products;
      `
    })
    
    console.log('✅ RLS enabled on tables')
    
    // Create profiles table policies
    console.log('📋 Creating profiles table policies...')
    
    await supabase.rpc('exec_sql', {
      sql: `
        -- Profiles table RLS policies
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
        
        -- Admin can manage all profiles
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
    
    console.log('✅ Profiles table policies created')
    
    // Create customers table policies
    console.log('📋 Creating customers table policies...')
    
    await supabase.rpc('exec_sql', {
      sql: `
        -- Customers table RLS policies
        CREATE POLICY "Users can view own customer data" ON customers
          FOR SELECT USING (auth.uid() = profile_id);
        
        CREATE POLICY "Users can update own customer data" ON customers
          FOR UPDATE USING (auth.uid() = profile_id);
        
        -- Admin can view all customer data
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
    
    console.log('✅ Customers table policies created')
    
    // Create orders table policies
    console.log('📋 Creating orders table policies...')
    
    await supabase.rpc('exec_sql', {
      sql: `
        -- Orders table RLS policies
        CREATE POLICY "Users can view own orders" ON orders
          FOR SELECT USING (auth.uid() = customer_id);
        
        CREATE POLICY "Users can create own orders" ON orders
          FOR INSERT WITH CHECK (auth.uid() = customer_id);
        
        -- Admin can view all orders
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
    
    console.log('✅ Orders table policies created')
    
    // Create addresses table policies
    console.log('📋 Creating addresses table policies...')
    
    await supabase.rpc('exec_sql', {
      sql: `
        -- Addresses table RLS policies
        CREATE POLICY "Users can view own addresses" ON addresses
          FOR SELECT USING (auth.uid() = customer_id);
        
        CREATE POLICY "Users can manage own addresses" ON addresses
          FOR ALL USING (auth.uid() = customer_id);
        
        -- Admin can view all addresses
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
    
    console.log('✅ Addresses table policies created')
    
    // Create products table policies
    console.log('📋 Creating products table policies...')
    
    await supabase.rpc('exec_sql', {
      sql: `
        -- Products table - Public read access
        CREATE POLICY "Public can view active products" ON products
          FOR SELECT USING (is_active = true);
        
        -- Admin can manage all products
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
    
    console.log('✅ Products table policies created')
    
    console.log('🎉 RLS Policies applied successfully!')
    console.log('📊 Summary:')
    console.log('  - RLS enabled on: profiles, customers, orders, addresses, products')
    console.log('  - User policies: Users can only access their own data')
    console.log('  - Admin policies: Admins can access all data')
    console.log('  - Public policies: Public can view active products')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error)
    return { success: false, error: error.message }
  }
}

// Run the function
applyRLSPolicies().catch(console.error)
