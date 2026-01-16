import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        categories (
          name,
          slug
        ),
        product_variants (
          price
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(10)

    if (error) {
      console.error('Search API error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Transform the data to get the first variant's price
    const transformedData = data?.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.product_variants?.[0]?.price || 0,
      image_url: product.image_url,
      categories: product.categories
    })) || []

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
