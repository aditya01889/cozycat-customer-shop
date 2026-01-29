import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Skip database calls in CI mode - return empty data
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    return NextResponse.json({ data: [] });
  }

  // Only import Supabase when not in CI mode
  const { createServerSupabaseClient } = await import('@/lib/supabase/server-helper');

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
