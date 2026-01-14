import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import ProductGrid from '@/components/ProductGrid'
import ProductFilters from '@/components/ProductFilters'

type Product = Database['public']['Tables']['products']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; price?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  // Fetch products with variants
  let productsQuery = supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .eq('is_active', true)
    .order('display_order')

  // Filter by category if specified
  if (resolvedParams.category) {
    // First get the category by slug to get its ID
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', resolvedParams.category)
      .single() as { data: { id: string } | null }
    
    if (category?.id) {
      productsQuery = productsQuery
        .eq('category_id', category.id)
    }
  }

  const { data: products } = await productsQuery

  // Fetch categories for each product separately
  const productsWithCategories = await Promise.all(
    (products || []).map(async (product: any) => {
      if (!product) return null
      
      const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('id', product.category_id)
        .single()
      
      return {
        ...product,
        categories: category
      }
    })
  )

  // Filter out null values
  const validProducts = productsWithCategories.filter(product => product !== null)

  // Filter by price range if specified
  let filteredProducts = validProducts
  if (resolvedParams.price) {
    filteredProducts = filteredProducts.filter(product => {
      const variants = product.product_variants || []
      const prices = variants.map((v: any) => v.price)
      const minPrice = Math.min(...prices)
      
      switch (resolvedParams.price) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters 
            categories={categories || []}
            selectedCategory={resolvedParams.category}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resolvedParams.category 
                ? categories?.find((c: any) => c.slug === resolvedParams.category)?.name || 'Products'
                : 'All Products'
              }
            </h1>
            <p className="text-gray-600">
              {filteredProducts?.length || 0} products available
            </p>
          </div>

          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  )
}
