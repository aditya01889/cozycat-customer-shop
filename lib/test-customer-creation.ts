import { supabase } from '@/lib/supabase/client'

export async function testCustomerCreation() {
  try {
    // Test if we can read from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .limit(1)
    
    console.log('Profiles test:', { profiles, profilesError })
    
    // Test if we can read from customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, profile_id, phone')
      .limit(1)
    
    console.log('Customers test:', { customers, customersError })
    
    // Test joining customers with profiles
    const { data: joined, error: joinError } = await supabase
      .from('customers')
      .select(`
        id,
        profiles!inner (
          full_name,
          email
        )
      `)
      .limit(1)
    
    console.log('Join test:', { joined, joinError })
    
    return {
      success: !profilesError && !customersError && !joinError,
      profiles: profiles?.length || 0,
      customers: customers?.length || 0,
      joined: joined?.length || 0
    }
  } catch (error: any) {
    console.error('Test error:', error)
    return { success: false, error: error.message }
  }
}
