'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/Toast/ToastProvider'

interface Product {
  id: string
  name: string
  image_url?: string
  product_variants: {
    id: string
    weight_grams: number
    price: number
    sku?: string
  }[]
}

interface QuickAddToCartProps {
  product: Product
  compact?: boolean
  showImage?: boolean
}

export default function QuickAddToCart({ product, compact = false, showImage = true }: QuickAddToCartProps) {
  const { addItem } = useCartStore()
  const { showSuccess, showError } = useToast()
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants[0])
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return

    setIsAdding(true)
    
    try {
      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        weight: selectedVariant.weight_grams,
        price: selectedVariant.price,
        quantity,
        sku: selectedVariant.sku || '',
        productImage: product.image_url
      })

      setAdded(true)
      showSuccess(`${product.name} (${formatWeight(selectedVariant.weight_grams)}) × ${quantity} added to cart!`)

      // Reset after 2 seconds
      setTimeout(() => {
        setAdded(false)
        setQuantity(1)
      }, 2000)
    } catch (error) {
      showError(error as Error)
    } finally {
      setIsAdding(false)
    }
  }

  if (added) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
        <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-green-700 font-medium">Added to cart!</p>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-white rounded-xl border border-gray-200`}>
      {/* Product Header */}
      <div className="flex items-start space-x-3 mb-4">
        {showImage && (
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl">🐾</span>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
          <p className="text-xs text-gray-500">Quick Add</p>
        </div>
      </div>

      {/* Variant Selection */}
      {product.product_variants.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 mb-2 block">Size:</label>
          <div className="grid grid-cols-2 gap-2">
            {product.product_variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`p-2 rounded-lg border-2 text-xs transition-all ${
                  selectedVariant?.id === variant.id
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium">{formatWeight(variant.weight_grams)}</div>
                <div className="text-gray-600">₹{variant.price}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Add Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Quantity:</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-medium text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant}
          className={`w-full py-2 px-4 rounded-full font-medium text-sm flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
            isAdding || !selectedVariant
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg'
          }`}
        >
          {isAdding ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add {quantity > 1 && `(${quantity})`}
            </>
          )}
        </button>

        {/* Price Display */}
        <div className="text-center text-xs text-gray-600">
          Total: ₹{selectedVariant ? (selectedVariant.price * quantity) : 0}
        </div>
      </div>
    </div>
  )
}
