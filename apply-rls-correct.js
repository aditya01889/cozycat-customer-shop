/**
 * Apply RLS Policies Correctly using Supabase SQL
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSPolicies() {
  console.log('🔒 Applying RLS Policies (Correct Method)...')
  
  try {
    // Enable RLS on profiles table
    console.log('📋 Enabling RLS on profiles table...')
    await supabase.rpc('sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    })
    
    // Create profiles policies
    console.log('📋 Creating profiles RLS policies...')
    
    // Policy for users to view their own profile
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
      `
    })
    
    // Policy for users to update their own profile
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    })
    
    // Policy for users to insert their own profile
    await supabase.rpc('sql', {
      sql: `
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    })
    
    // Policy for admins to manage all profiles
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
    
    console.log('✅ Profiles RLS policies created')
    
    // Enable RLS on customers table
    console.log('📋 Enabling RLS on customers table...')
    await supabase.rpc('sql', {
      sql: 'ALTER TABLE customers ENABLE ROW LEVEL SECURITY;'
    })
    
    // Create customers policies
    console.log('📋 Creating customers RLS policies...')
    
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
    
    console.log('✅ Customers RLS policies created')
    
    // Enable RLS on orders table
    console.log('📋 Enabling RLS on orders table...')
    await supabase.rpc('sql', {
      sql: 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY;'
    })
    
    // Create orders policies
    console.log('📋 Creating orders RLS policies...')
    
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
    
    console.log('✅ Orders RLS policies created')
    
    // Enable RLS on addresses table
    console.log('📋 Enabling RLS on addresses table...')
    await supabase.rpc('sql', {
      sql: 'ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;'
    })
    
    // Create addresses policies
    console.log('📋 Creating addresses RLS policies...')
    
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
    
    console.log('✅ Addresses RLS policies created')
    
    // Enable RLS on products table
    console.log('📋 Enabling RLS on products table...')
    await supabase.rpc('sql', {
      sql: 'ALTER TABLE products ENABLE ROW LEVEL SECURITY;'
    })
    
    // Create products policies
    console.log('📋 Creating products RLS policies...')
    
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
    
    console.log('✅ Products RLS policies created')
    
    console.log('🎉 RLS Policies applied successfully!')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error)
    return { success: false, error: error.message }
  }
}

// Run the function
applyRLSPolicies().catch(console.error)
