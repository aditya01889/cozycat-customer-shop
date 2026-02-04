import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Product query schema for validation
const productQuerySchema = z.object({
  id: z.string().uuid('Invalid product ID format').optional(),
  category: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: Request) {
  try {
    // DEBUG: Log the Supabase URL being used
    const supabaseConfig = (await import('@/lib/env-validation')).getSupabaseConfig();
    console.log('DEBUG: Supabase URL being used:', supabaseConfig.url);
    
    // Parse query parameters from URL
    const { searchParams } = new URL(request.url)
    const queryParams = {
      id: searchParams.get('id') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    }

    // Validate query parameters
    const validationResult = productQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues.map(issue => issue.message).join(', ')
        },
        { status: 400 }
      )
    }

    const { id, category, search, limit, offset } = validationResult.data
    const supabase = await createClient()

    // If specific ID requested, return single product
    if (id) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          image_url,
          is_active,
          display_order,
          category_id,
          packaging_type,
          label_type,
          packaging_quantity_per_product,
          label_quantity_per_product,
          nutritional_info,
          ingredients_display,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Product fetch error:', error)
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ product: data })
    }

    // Otherwise, return product list with optional filtering
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        image_url,
        is_active,
        display_order,
        category_id,
        packaging_type,
        label_type,
        packaging_quantity_per_product,
        label_quantity_per_product,
        nutritional_info,
        ingredients_display,
        created_at,
        updated_at
      `)
      .eq('is_active', true)

    // Apply filters
    if (category) {
      query = query.eq('category_id', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    const { data: productsData, error, count } = await query

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json({
      products: productsData || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
