'use client'

import { useCartStore } from '@/lib/store/cart'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any delicious cat food yet!</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Browse Products
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const total = subtotal + deliveryFee

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🍽️</span>
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">{formatWeight(item.weight)}</p>
                  <p className="text-sm font-medium text-orange-500">₹{item.price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Item Total */}
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-sm text-gray-600">Item total</span>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Clear Cart
            </button>
            <Link
              href="/products"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              
              {subtotal < 500 && (
                <p className="text-xs text-green-600">
                  Add ₹{500 - subtotal} more for free delivery!
                </p>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">₹{total}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-full hover:bg-orange-600 transition-colors font-medium text-center block"
            >
              Proceed to Checkout
            </Link>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>• Cash on Delivery (COD) available</p>
              <p>• Made fresh to order</p>
              <p>• 2-4 days delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
