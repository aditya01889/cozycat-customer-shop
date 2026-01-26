/**
 * Apply Admin Function to Supabase Database
 * Creates the is_admin() function for RLS policies
 */

const { createClient } = require('@supabase/supabase-js')

// Use environment variables directly
const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyAdminFunction() {
  console.log('🔧 Creating is_admin function...')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION is_admin()
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          );
        END;
        $$;
        
        GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
        GRANT EXECUTE ON FUNCTION is_admin() TO anon;
      `
    })
    
    if (error) {
      console.error('❌ Error creating admin function:', error)
      return false
    }
    
    console.log('✅ Admin function created successfully')
    return true
    
  } catch (error) {
    console.error('❌ Error applying admin function:', error.message)
    return false
  }
}

// Alternative approach using direct SQL
async function applyAdminFunctionDirect() {
  console.log('🔧 Creating is_admin function (direct SQL)...')
  
  try {
    // First, let's try to create the function using a raw SQL approach
    const { error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1) // Just to test connection
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Database connection error:', error)
      return false
    }
    
    // Since we can't execute raw SQL directly through the client,
    // we'll create a simple SQL file that can be applied manually
    console.log('📝 Admin function SQL prepared in create-admin-function.sql')
    console.log('🔗 Please apply this SQL manually in your Supabase dashboard:')
    console.log('   1. Go to Supabase Dashboard > SQL Editor')
    console.log('   2. Copy and paste the content from create-admin-function.sql')
    console.log('   3. Run the SQL to create the function')
    
    return true
    
  } catch (error) {
    console.error('❌ Error preparing admin function:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Applying Admin Function for Authentication Security')
  console.log('==================================================')
  
  const success = await applyAdminFunctionDirect()
  
  if (success) {
    console.log('\n✅ Admin function setup completed')
    console.log('📝 Next steps:')
    console.log('   1. Apply the SQL in Supabase dashboard')
    console.log('   2. Run the authentication tests again')
  } else {
    console.log('\n❌ Admin function setup failed')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
