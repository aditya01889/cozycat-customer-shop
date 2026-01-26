import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

type Product = Database['public']['Tables']['products']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type Category = Database['public']['Tables']['categories']['Row']

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

// Loading component
function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse bg-gray-200 h-10 rounded-lg mb-6"></div>
      <div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}

async function getOptimizedProducts(
  search?: string,
  categorySlug?: string,
  priceRange?: string
) {
  const supabase = await createClient()
  
  try {
    // Get category ID if category slug is provided
    let categoryId: string | null = null
    if (categorySlug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      categoryId = (category as any)?.id || null
    }

    // Optimized single query with JOIN to avoid N+1 problem
    let query = supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        categories!inner (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Apply category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Products query error:', error)
      return { products: [], categories: [] }
    }

    // Apply price filtering on the results
    let filteredProducts = products || []
    if (priceRange) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const variants = (product.product_variants as ProductVariant[]) || []
        const prices = variants.map((v: ProductVariant) => v.price).filter((p: number | null) => p != null)
        
        if (prices.length === 0) return false
        
        const minPrice = Math.min(...prices)
        
        switch (priceRange) {
          case 'under-100':
            return minPrice < 100
          case '100-200':
            return minPrice >= 100 && minPrice <= 200
          case '200-400':
            return minPrice >= 200 && minPrice <= 400
          case 'above-400':
            return minPrice > 400
          default:
            return true
        }
      })
    }

    // Get all categories for filters
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    return { 
      products: filteredProducts, 
      categories: categories || [] 
    }
  } catch (error) {
    console.error('Error in getOptimizedProducts:', error)
    return { products: [], categories: [] }
  }
}

// Main Products Content Component
async function ProductsContent({
  search,
  category,
  price
}: {
  search?: string
  category?: string
  price?: string
}) {
  const { products, categories } = await getOptimizedProducts(search, category, price)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>}>
          <SearchInput />
        </Suspense>
        
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
          <ProductFilters categories={categories} />
        </Suspense>
      </div>

      {/* Products Grid */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      }>
        <ProductGrid products={products} />
      </Suspense>

      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}

export default async function ProductsPageOptimized({
  searchParams
}: {
  searchParams: Promise<{ category?: string; price?: string; search?: string }>
}) {
  const resolvedParams = await searchParams
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ProductsLoading />}>
        <ProductsContent 
          search={resolvedParams.search}
          category={resolvedParams.category}
          price={resolvedParams.price}
        />
      </Suspense>
    </div>
  )
}
