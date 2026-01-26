import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import OptimizedProductGrid from '@/components/OptimizedProductGrid'
import OptimizedProductFilters from '@/components/OptimizedProductFilters'
import { Suspense } from 'react'

// Server component for initial data loading
async function getInitialData() {
  const supabase = await createClient()

  // Get categories with product counts (optimized)
  const { data: categories } = await supabase.rpc('get_categories_with_product_count')

  // Get popular products (from materialized view)
  const { data: popularProducts } = await supabase
    .from('popular_products')
    .select('*')
    .limit(8)

  return { categories, popularProducts }
}

// Loading component for Suspense
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-3 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function OptimizedProductsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; price?: string; search?: string; page?: string }>
}) {
  const resolvedParams = await searchParams
  
  // Get initial data server-side
  const { categories, popularProducts } = await getInitialData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fresh Cat Food</h1>
              <p className="text-gray-600 mt-1">Premium nutrition for your feline friend</p>
            </div>
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <Suspense fallback={<div className="animate-pulse bg-white rounded-lg shadow p-6 h-64"></div>}>
              <OptimizedProductFilters categories={categories} />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {/* Popular Products Section */}
            {popularProducts && popularProducts.length > 0 && !resolvedParams.search && !resolvedParams.category && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🔥 Popular This Week</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularProducts.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={product.image_url || '/placeholder-cat-food.jpg'}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {product.total_sold} sold
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.category_name}</p>
                        <p className="text-lg font-bold text-orange-600">₹{product.avg_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Products Grid */}
            <Suspense fallback={<ProductsLoading />}>
              <OptimizedProductGrid 
                searchParams={resolvedParams}
                categories={categories}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
