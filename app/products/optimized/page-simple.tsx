import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import components for better code splitting
const ProductGrid = dynamic(() => import('@/components/ProductGrid'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      ))}
    </div>
  )
})

const ProductFilters = dynamic(() => import('@/components/ProductFilters'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-6"></div>
  )
})

const SearchInput = dynamic(() => import('@/components/SearchInput'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-10 rounded-lg mb-6"></div>
  )
})

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

// Loading component
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  )
}

// Simple and fast server component
export default async function ProductsPageSimple({
  searchParams
}: {
  searchParams: Promise<{ category?: string; price?: string; search?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  
  const startTime = Date.now()
  
  try {
    // Single, optimized query to get products with categories
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        short_description,
        image_url,
        is_active,
        display_order,
        category_id,
        created_at,
        updated_at,
        categories!inner (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Apply filters
    if (resolvedParams.search) {
      query = query.ilike('name', `%${resolvedParams.search}%`)
    }

    if (resolvedParams.category) {
      // Get category ID efficiently
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', resolvedParams.category)
        .single()
      
      if (category?.id) {
        query = query.eq('category_id', category.id)
      }
    }

    // Apply pagination
    const limit = 20
    const page = parseInt(resolvedParams.page || '1')
    const offset = (page - 1) * limit
    
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: products, error } = await query

    if (error) {
      console.error('Products query error:', error)
      throw new Error('Failed to fetch products')
    }

    // Get total count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .ilike('name', resolvedParams.search ? `%${resolvedParams.search}%` : '%%')
      .eq('category_id', resolvedParams.category ? (async () => {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', resolvedParams.category)
          .single()
        return category?.id || null
      })() : true)

    const loadTime = Date.now() - startTime
    console.log(`📦 Products loaded in ${loadTime}ms`)

    // Get categories for filters
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-10 rounded-lg mb-6"></div>}>
              <SearchInput />
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-6"></div>}>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>

          {/* Products Grid */}
          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid products={products || []} />
          </Suspense>

          {/* Empty State */}
          {(!products || products.length === 0) && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Pagination Info */}
          {products && products.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Showing {products.length} products
              {count && (
                <span className="ml-2">
                  (Total: {count} products)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Products page error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-4">Error loading products</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    )
  }
}
