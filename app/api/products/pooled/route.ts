import { NextResponse } from 'next/server'
import { z } from 'zod'

// Product query schema for validation
const productQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
})

export async function GET(request: Request) {
  // Skip database calls in CI mode - return empty data
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    return NextResponse.json({ 
      data: [],
      pagination: {
        limit: 20,
        offset: 0,
        total: 0,
        hasMore: false
      }
    });
  }

  // Only import DatabaseHelper when not in CI mode
  const { DatabaseHelper } = await import('@/lib/database/connection-pool');

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      category: searchParams.get('category') || undefined,
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

    const { limit, offset, category } = validationResult.data

    // Use connection pool for database query
    const { data: products, count } = await DatabaseHelper.executeQuery(async (client) => {
      let query = client
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

      // Apply pagination
      query = query
        .range(offset, offset + limit - 1)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      const { data, count, error } = await query
      
      if (error) {
        throw new Error('Failed to fetch products')
      }

      return { data, count }
    })

    return NextResponse.json({
      products: products || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      },
      poolStats: DatabaseHelper.getPoolStats()
    })

  } catch (error) {
    console.error('Pooled Products API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
