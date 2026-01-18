import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create admin client to check table structure
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if table exists and get its structure
    const { data: tables, error: tablesError } = await adminSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'customer_addresses')

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
      return NextResponse.json({ error: 'Failed to check tables', details: tablesError }, { status: 500 })
    }

    // Get column information
    const { data: columns, error: columnsError } = await adminSupabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'customer_addresses')
      .order('ordinal_position')

    if (columnsError) {
      console.error('Error checking columns:', columnsError)
      return NextResponse.json({ error: 'Failed to check columns', details: columnsError }, { status: 500 })
    }

    // Try a simple insert test
    const testInsert = {
      customer_id: '1bdc0d75-de5a-462e-8050-78169ac09139',
      address_line1: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      is_default: false
    }

    console.log('Testing insert with data:', testInsert)

    const { data: insertResult, error: insertError } = await adminSupabase
      .from('customer_addresses')
      .insert(testInsert)
      .select()
      .single()

    return NextResponse.json({
      success: true,
      tables,
      columns,
      testInsert: {
        data: insertResult,
        error: insertError
      }
    })

  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json(
      { 
        error: 'Debug route error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      },
      { status: 500 }
    )
  }
}
