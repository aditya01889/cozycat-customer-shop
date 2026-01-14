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
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants[0])
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      weight: selectedVariant.weight_grams,
      price: selectedVariant.price,
      quantity,
      sku: selectedVariant.sku || ''
    })
    
    toast.success(`${product.name} added to cart!`, {
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
            <span className="text-3xl font-bold text-gray-900">₹{selectedVariant.price}</span>
            <span className="text-lg text-gray-500">{formatWeight(selectedVariant.weight_grams)}</span>
          </div>

          {/* Variants */}
          {product.product_variants.length > 1 && (
            <div>
              <h3 className="font-semibold mb-3">Choose Size:</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.product_variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedVariant.id === variant.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{formatWeight(variant.weight_grams)}</div>
                    <div className="text-sm text-gray-600">₹{variant.price}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-full hover:bg-orange-600 transition-colors font-medium flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-50">
              <Heart className="w-5 h-5" />
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
