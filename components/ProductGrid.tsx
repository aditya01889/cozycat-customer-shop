'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import { Database } from '@/types/database'
import { ShoppingCart, X, ChevronDown } from 'lucide-react'

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
        <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
          <span className="text-4xl">😿</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
        <p className="text-lg text-gray-600">Try adjusting your filters or check back later for more delicious cat meals!</p>
        <div className="mt-8">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-gray-500">Your cat is waiting for fresh food!</p>
        </div>
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
  const [showVariantModal, setShowVariantModal] = useState(false)
  const variants = product.product_variants
  const minPrice = Math.min(...variants.map(v => v.price))
  const maxPrice = Math.max(...variants.map(v => v.price))
  const hasMultiplePrices = minPrice !== maxPrice
  const hasMultipleVariants = variants.length > 1

  const getCategoryEmoji = (categorySlug: string) => {
    switch (categorySlug) {
      case 'meals': return '🍽️'
      case 'broths': return '🥣'
      case 'cookies': return '🍪'
      case 'cupcakes': return '🧁'
      default: return '📦'
    }
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  const handleAddToCart = (variant: any) => {
    if (!variant || variant.weight_grams === undefined) {
      toast.error('Product variant not available')
      return
    }
    
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      weight: variant.weight_grams,
      price: variant.price,
      quantity: 1,
      sku: variant.sku || '',
      productImage: product.image_url || undefined
    })
    toast.success(`${product.name} (${formatWeight(variant.weight_grams)}) added to cart!`)
    setShowVariantModal(false)
  }

  const handleAddToCartClick = () => {
    if (hasMultipleVariants) {
      setShowVariantModal(true)
    } else {
      // Add the only variant directly
      const firstVariant = variants[0]
      if (firstVariant && firstVariant.weight_grams !== undefined) {
        handleAddToCart(firstVariant)
      } else {
        toast.error('Product variant not available')
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-orange-50 to-pink-50 relative overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100">
              <span className="text-6xl">
                {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            <span className="mr-1">🐾</span>
            {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors text-lg">
            {product.name}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.short_description || product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              {hasMultiplePrices ? (
                <span className="text-xl font-bold text-orange-600">
                  ₹{minPrice} - ₹{maxPrice}
                </span>
              ) : (
                <span className="text-xl font-bold text-orange-600">
                  ₹{minPrice}
                </span>
              )}
              <div className="text-sm text-gray-500">
                {variants.length} size{variants.length > 1 ? 's' : ''} available
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAddToCartClick()
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold flex items-center justify-center"
        >
          <span className="mr-2">🛒</span>
          {hasMultipleVariants ? 'Choose Size' : 'Add to Cart'}
        </button>
      </div>

        {/* Variant Selection Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Choose Size</h3>
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">{product.name}</p>
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleAddToCart(variant)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatWeight(variant.weight_grams)}
                          </div>
                          <div className="text-sm text-gray-600">
                            ₹{variant.price}
                          </div>
                        </div>
                        <div className="text-orange-500">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
