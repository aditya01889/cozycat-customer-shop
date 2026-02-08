import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-helper'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        categories(name)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
