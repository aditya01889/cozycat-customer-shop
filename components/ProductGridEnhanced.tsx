'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import { Database } from '@/types/database'
import { ShoppingCart, X, ChevronDown, Eye, Plus, Loader2 } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ProductGridEnhancedProps {
  products: Product[]
  itemsPerPage?: number
}

export default function ProductGridEnhanced({ products, itemsPerPage = 8 }: ProductGridEnhancedProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showQuickView, setShowQuickView] = useState(false)
  const observer = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initialize displayed products
  useEffect(() => {
    setDisplayedProducts(products.slice(0, itemsPerPage))
    setCurrentPage(1)
  }, [products, itemsPerPage])

  // Load more products
  const loadMore = useCallback(() => {
    if (loading || displayedProducts.length >= products.length) return
    
    setLoading(true)
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1
      const endIndex = nextPage * itemsPerPage
      const newProducts = products.slice(displayedProducts.length, endIndex)
      
      setDisplayedProducts(prev => [...prev, ...newProducts])
      setCurrentPage(nextPage)
      setLoading(false)
    }, 500)
  }, [currentPage, displayedProducts.length, products, itemsPerPage, loading])

  // Intersection Observer for infinite scroll
  const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedProducts.length < products.length) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, displayedProducts.length, products.length, loadMore])

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
    <div>
      {/* Products Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {displayedProducts.map((product, index) => (
          <div
            key={product.id}
            ref={index === displayedProducts.length - 3 ? lastProductElementRef : undefined}
          >
            <ProductCardEnhanced 
              product={product} 
              onQuickView={() => {
                setSelectedProduct(product)
                setShowQuickView(true)
              }}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {displayedProducts.length < products.length && (
        <div className="flex justify-center mt-8" ref={loadMoreRef}>
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Load More Products ({products.length - displayedProducts.length} remaining)
              </>
            )}
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}

// Enhanced Product Card with Compact Design
function ProductCardEnhanced({ product, onQuickView }: { 
  product: Product
  onQuickView: () => void
}) {
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
      const firstVariant = variants[0]
      if (firstVariant && firstVariant.weight_grams !== undefined) {
        handleAddToCart(firstVariant)
      } else {
        toast.error('Product variant not available')
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden group relative">
      {/* Quick View Button */}
      <button
        onClick={onQuickView}
        className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
        title="Quick View"
      >
        <Eye className="w-4 h-4 text-gray-700" />
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-orange-50 to-pink-50 relative overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100">
              <span className="text-4xl">
                {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
              </span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            <span className="mr-1">🐾</span>
            {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {/* Product Name - Truncated */}
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors text-sm sm:text-base line-clamp-1">
            {product.name}
          </h3>

          {/* Description - Hidden on mobile for compactness */}
          <div className="hidden sm:block text-gray-600 mb-2 line-clamp-1 text-xs">
            {product.short_description || product.description}
          </div>

          {/* Price and Sizes */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              {hasMultiplePrices ? (
                <span className="text-sm sm:text-base font-bold text-orange-600">
                  ₹{minPrice} - ₹{maxPrice}
                </span>
              ) : (
                <span className="text-sm sm:text-base font-bold text-orange-600">
                  ₹{minPrice}
                </span>
              )}
              <div className="text-xs text-gray-500">
                {variants.length} size{variants.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAddToCartClick()
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-3 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-xs sm:text-sm flex items-center justify-center"
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          {hasMultipleVariants ? 'Choose' : 'Add'}
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
                            {variant.weight_grams ? formatWeight(variant.weight_grams) : 'Weight not available'}
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

// Quick View Modal Component
function QuickViewModal({ product, isOpen, onClose }: { 
  product: Product | null
  isOpen: boolean
  onClose: () => void
}) {
  const { addItem } = useCartStore()
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  if (!isOpen || !product) return null

  const variants = product.product_variants
  const hasMultipleVariants = variants.length > 1

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  const handleAddToCart = () => {
    const variant = selectedVariant || variants[0]
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
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick View</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">📦</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">
                {product.short_description || product.description}
              </p>

              {/* Variants */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Select Size:</h4>
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <label
                      key={variant.id}
                      className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name="variant"
                        className="mr-3"
                        checked={selectedVariant?.id === variant.id || (!selectedVariant && variant === variants[0])}
                        onChange={() => setSelectedVariant(variant)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{variant.weight_grams ? formatWeight(variant.weight_grams) : 'Weight not available'}</div>
                        <div className="text-orange-600 font-bold">₹{variant.price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-bold"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Add to Cart
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="block w-full text-center py-3 border-2 border-orange-500 text-orange-600 rounded-full hover:bg-orange-50 transition-all duration-300 font-bold"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
