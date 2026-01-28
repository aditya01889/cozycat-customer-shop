'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import { Database } from '@/types/database'
import { ShoppingCart, X, Plus } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGridWithPacks({ products }: ProductGridProps) {
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
  const { addItem, items } = useCartStore()
  
  // Create a local function to get cart item quantity
  const getCartItemQuantity = (productId: string, variantId: string) => {
    const item = items.find(i => i.productId === productId && i.variantId === variantId)
    return item ? item.quantity : 0
  }
  const [showVariantModal, setShowVariantModal] = useState(false)
  const variants = product.product_variants
  const minPrice = Math.min(...variants.map(v => v.price))
  const maxPrice = Math.max(...variants.map(v => v.price))
  const hasMultiplePrices = minPrice !== maxPrice
  const hasMultipleVariants = variants.length > 1

  // Check if product is in meals or broth category for pack options
  const isMealOrBroth = product.categories?.slug === 'meals' || product.categories?.slug === 'broths'

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

  const handleAddToCart = (variant: any, quantity: number = 1) => {
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      weight: variant.weight_grams,
      price: variant.price,
      quantity: quantity,
      sku: variant.sku || '',
      productImage: product.image_url || undefined
    })
    toast.success(`${product.name} (${formatWeight(variant.weight_grams)}) x${quantity} added to cart!`)
    setShowVariantModal(false)
  }

  const handleAddToCartClick = () => {
    if (hasMultipleVariants || isMealOrBroth) {
      setShowVariantModal(true)
    } else {
      // Add the only variant directly
      handleAddToCart(variants[0])
    }
  }

  const getTotalCartCount = () => {
    return variants.reduce((total, variant) => total + getCartItemQuantity(product.id, variant.id), 0)
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
          {/* Cart count indicator */}
          {getTotalCartCount() > 0 && (
            <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {getTotalCartCount()}
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{formatWeight(variants[0].weight_grams)}</p>
          <p className="text-lg font-bold text-orange-600">₹{minPrice}</p>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAddToCartClick()
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold flex items-center justify-center relative"
        >
          <span className="mr-2">🛒</span>
          {getTotalCartCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getTotalCartCount()}
            </span>
          )}
          {hasMultipleVariants || isMealOrBroth ? 'Choose Options' : 'Add to Cart'}
        </button>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" 
          onClick={() => setShowVariantModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {isMealOrBroth ? '🎁 Choose Size & Pack' : '📏 Choose Size'}
                </h3>
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{product.name}</p>
              
              <div className="space-y-3">
                {variants.map((variant) => {
                  const currentQuantity = getCartItemQuantity(product.id, variant.id)
                  return (
                    <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
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

                      {/* Pack options for meals and broths */}
                      {isMealOrBroth && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            💝 Choose Pack Size
                          </div>
                          <div className="flex flex-col space-y-2">
                            <select
                              id={`pack-select-${variant.id}`}
                              value={1}
                              onChange={(e) => handleAddToCart(variant, parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                            >
                              <option value={1}>Pack of 1</option>
                              <option value={5}>Pack of 5 (Best Value)</option>
                              <option value={10}>Pack of 10 (Save 20%)</option>
                            </select>
                            <button
                              onClick={() => {
                                const select = document.getElementById(`pack-select-${variant.id}`) as HTMLSelectElement
                                handleAddToCart(variant, parseInt(select.value))
                              }}
                              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Single add button for non-meal/broth products */}
                      {!isMealOrBroth && (
                        <button
                          onClick={() => handleAddToCart(variant, 1)}
                          className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </button>
                      )}

                      {/* Show current quantity */}
                      {currentQuantity > 0 && (
                        <div className="mt-2 text-sm text-pink-600 font-medium text-center">
                          {currentQuantity} in cart
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
