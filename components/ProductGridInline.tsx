'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import { Database } from '@/types/database'
import { Plus } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGridInline({ products }: ProductGridProps) {
  const { items } = useCartStore()
  
  // Create a local function to get cart item quantity
  const getCartItemQuantity = (productId: string, variantId: string) => {
    const item = items.find(i => i.productId === productId && i.variantId === variantId)
    return item ? item.quantity : 0
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
          <span className="text-4xl">😿</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
        <p className="text-lg text-gray-600">Try adjusting your filters or check back later for more delicious cat meals!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} getCartItemQuantity={getCartItemQuantity} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  getCartItemQuantity: (productId: string, variantId: string) => number
}

function ProductCard({ product, getCartItemQuantity }: ProductCardProps) {
  const { addItem } = useCartStore()
  
  // Safely handle variants with fallback
  const variants = product.product_variants || []
  const hasValidVariants = variants.length > 0 && variants.some(v => v?.weight_grams !== undefined && v?.weight_grams !== null)
  
  // Set initial selected variant safely
  const [selectedVariant, setSelectedVariant] = useState(
    hasValidVariants ? variants.find(v => v?.weight_grams !== undefined && v?.weight_grams !== null) || null : null
  )
  const [selectedPack, setSelectedPack] = useState(1)
  
  // Calculate min price safely
  const minPrice = hasValidVariants 
    ? Math.min(...variants.filter(v => v?.price !== undefined).map(v => v.price))
    : 0
  
  const isMealOrBroth = product.categories?.slug === 'meals' || product.categories?.slug === 'broths'
  
  const getTotalCartCount = () => {
    return variants.reduce((total, variant) => total + getCartItemQuantity(product.id, variant.id), 0)
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

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
    if (!selectedVariant) {
      toast.error('Product variant not available')
      return
    }
    
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      weight: selectedVariant.weight_grams || 0,
      price: selectedVariant.price || 0,
      quantity: selectedPack,
      sku: selectedVariant.sku || '',
      productImage: product.image_url || undefined
    })
    toast.success(`${product.name} added to cart!`)
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
          {getTotalCartCount() > 0 && (
            <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {getTotalCartCount()}
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight" title={product.name}>
            <span 
              className="block overflow-hidden" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '3rem',
                lineHeight: '1.5rem'
              }}
            >
              {product.name}
            </span>
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {hasValidVariants && variants.find(v => v?.weight_grams !== undefined && v?.weight_grams !== null)?.weight_grams 
              ? formatWeight(variants.find(v => v?.weight_grams !== undefined && v?.weight_grams !== null)!.weight_grams) 
              : 'Weight not available'
            }
          </p>
          <p className="text-lg font-bold text-orange-600">₹{minPrice}</p>
        </div>
      </Link>

      <div className="px-6 pb-6">
        {/* Inline Controls - Always Present */}
        <div className="space-y-3">
          {/* Variant Selector */}
          {variants.length > 1 && hasValidVariants && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Size:</span>
              <select
                value={selectedVariant?.id || ''}
                onChange={(e) => {
                  const variant = variants.find(v => v.id === e.target.value)
                  if (variant && variant.weight_grams !== undefined) {
                    setSelectedVariant(variant)
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
              >
                {variants.filter(v => v?.weight_grams !== undefined).map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.weight_grams ? formatWeight(variant.weight_grams) : 'Weight not available'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pack Selector for Meals/Broth */}
          {isMealOrBroth && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Pack:</span>
              <select
                value={selectedPack}
                onChange={(e) => setSelectedPack(parseInt(e.target.value))}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
              >
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!hasValidVariants}
            className={`w-full py-2 px-4 rounded-full transition-all duration-300 transform font-bold flex items-center justify-center relative ${
              hasValidVariants 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="mr-2">🛒</span>
            {hasValidVariants ? 'Add to Cart' : 'Unavailable'}
            {hasValidVariants && getTotalCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalCartCount()}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
