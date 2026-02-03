'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Database } from '@/types/database'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import { Minus, Plus, ShoppingCart, Heart, Star, Truck, Clock } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories: Database['public']['Tables']['categories']['Row']
}

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants?.[0] || null)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  // Debug: Log product variants to see what's available
  console.log('Product variants:', product.product_variants)
  console.log('Selected variant:', selectedVariant)

  const handleAddToCart = () => {
    console.log('Add to cart clicked, selected variant:', selectedVariant)
    
    if (!selectedVariant || selectedVariant.weight_grams === undefined) {
      toast.error('Please select a valid variant first', {
        icon: '⚠️',
      })
      return
    }

    const cartItem = {
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      weight: selectedVariant.weight_grams,
      price: selectedVariant.price,
      quantity,
      sku: selectedVariant.sku || '',
      productImage: product.image_url || undefined
    }
    
    console.log('Adding to cart:', cartItem)
    
    addItem(cartItem)
    
    toast.success(`${product.name} (${formatWeight(selectedVariant.weight_grams)}) added to cart!`, {
      icon: '🛒',
    })
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={600}
                height={600}
                loading="eager"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                <span className="text-8xl">
                  {product.categories.slug === 'meals' ? '🍽️' :
                   product.categories.slug === 'broths' ? '🥣' :
                   product.categories.slug === 'cookies' ? '🍪' : '🧁'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Home</span>
            <span>/</span>
            <span>{product.categories.name}</span>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.short_description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">4.8 (127 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {selectedVariant ? `₹${selectedVariant.price}` : 'Price not available'}
            </span>
            {selectedVariant && (
              <span className="text-lg text-gray-500">{selectedVariant.weight_grams ? formatWeight(selectedVariant.weight_grams) : 'Weight not available'}</span>
            )}
          </div>

          {/* Variants */}
          <div>
            <h3 className="font-semibold mb-3">
              {!product.product_variants || product.product_variants.length === 0 
                ? 'No variants available' 
                : product.product_variants.length > 1 
                  ? 'Choose Size:' 
                  : 'Size:'
              }
            </h3>
            {!product.product_variants || product.product_variants.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-500">
                No variants available for this product.
              </div>
            ) : (
              <div className={`grid ${product.product_variants.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {product.product_variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{variant.weight_grams ? formatWeight(variant.weight_grams) : 'Weight not available'}</div>
                    <div className="text-sm text-gray-600">₹{variant.price}</div>
                    {selectedVariant?.id === variant.id && (
                      <div className="text-xs text-orange-600 font-medium mt-1">✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Quantity:</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className={`flex-1 py-4 px-6 rounded-full font-medium flex items-center justify-center transition-all transform active:scale-95 min-h-[56px] text-base sm:text-sm ${
                selectedVariant
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-6 h-6 mr-2 sm:w-5 sm:h-5" />
              {selectedVariant ? 'Add to Cart' : 'Select a variant'}
            </button>
            <button className="p-4 rounded-full border border-gray-300 hover:bg-gray-50 min-h-[56px] min-w-[56px] flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-orange-500" />
              <span className="text-sm">Free delivery on orders above ₹500</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm">Made fresh to order</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Ingredients */}
          {product.ingredients_display && (
            <div>
              <h3 className="font-semibold mb-3">Ingredients</h3>
              <p className="text-gray-600">{product.ingredients_display}</p>
            </div>
          )}

          {/* Nutrition Info */}
          {product.nutritional_info && (
            <div>
              <h3 className="font-semibold mb-3">Nutritional Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(product.nutritional_info, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
