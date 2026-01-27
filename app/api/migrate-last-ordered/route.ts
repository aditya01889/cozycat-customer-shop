import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/env-validation'

export async function POST() {
  try {
    const supabase = createClient(
      getSupabaseConfig().supabaseUrl,
      getSupabaseConfig().serviceRoleKey
    )

    // Add last_ordered column to vendors table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_ordered timestamp with time zone;'
    })

    if (alterError) {
      console.error('Error adding last_ordered column:', alterError)
      return NextResponse.json({ error: 'Failed to add last_ordered column' }, { status: 500 })
    }

    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_vendors_last_ordered ON vendors(last_ordered);'
    })

    if (indexError) {
      console.error('Error creating index:', indexError)
      return NextResponse.json({ error: 'Failed to create index' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully added last_ordered column to vendors table' 
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
