'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const variants = product.product_variants
  const minPrice = Math.min(...variants.map(v => v.price))
  const maxPrice = Math.max(...variants.map(v => v.price))
  const hasMultiplePrices = minPrice !== maxPrice

  const getCategoryEmoji = (categorySlug: string) => {
    switch (categorySlug) {
      case 'meals': return '🍽️'
      case 'broths': return '🥣'
      case 'cookies': return '🍪'
      case 'cupcakes': return '🧁'
      default: return '📦'
    }
  }

  const handleAddToCart = () => {
    // Add the first/cheapest variant to cart
    const firstVariant = variants[0]
    if (firstVariant) {
      addItem({
        productId: product.id,
        variantId: firstVariant.id,
        productName: product.name,
        weight: firstVariant.weight_grams,
        price: firstVariant.price,
        quantity: 1,
        sku: firstVariant.sku || ''
      })
      toast.success(`${product.name} added to cart!`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
              <span className="text-4xl">
                {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
              </span>
            </div>
          )}
        </div>

      </Link>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.short_description || product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            {hasMultiplePrices ? (
              <span className="text-lg font-bold text-gray-900">
                ₹{minPrice} - ₹{maxPrice}
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ₹{minPrice}
              </span>
            )}
            <div className="text-xs text-gray-500">
              {variants.length} size{variants.length > 1 ? 's' : ''} available
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
