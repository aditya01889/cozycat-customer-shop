'use client'

import { useCartStore } from '@/lib/store/cart'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, updateCartItemsWithImages } = useCartStore()

  // Debug: Log cart items to see what data we have
  console.log('Cart items:', items)

  // Fetch missing product images when component mounts
  useEffect(() => {
    updateCartItemsWithImages()
  }, [updateCartItemsWithImages])

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            {/* Empty Cart Illustration */}
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <ShoppingCart className="w-16 h-16 text-orange-500" />
              </div>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>😺</div>
            </div>
            
            {/* Main Message */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your cat is waiting for delicious meals! Let's fill this cart with some tasty treats! 🐾
            </p>
            
            {/* Call to Action */}
            <div className="space-y-4">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
              >
                <span className="mr-3">🍽️</span>
                Browse Delicious Meals
                <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🚚</span>
                  <span>Free delivery above ₹500</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">💰</span>
                  <span>Cash on delivery</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">⭐</span>
                  <span>Made fresh to order</span>
                </div>
              </div>
            </div>
            
            {/* Cat Animation */}
            <div className="mt-12">
              <div className="flex justify-center space-x-4">
                <span className="text-3xl animate-pulse">🐾</span>
                <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</span>
                <span className="text-3xl animate-ping" style={{ animationDelay: '0.4s' }}>🐾</span>
              </div>
              <p className="text-gray-600 mt-4">
                Thank you for choosing CozyCatKitchen! Your cat will love you for it! 😺
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/products" className="flex items-center text-gray-600 hover:text-gray-900 mr-4 whitespace-nowrap">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <span className="text-xl sm:text-2xl mr-3">🛒</span>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Shopping Cart</h1>
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl">🛒</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Your Shopping Cart
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Review your delicious cat food selections 🐾
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 sm:p-6">
                <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                  {/* Product Image - Fixed dimensions, no shrinking */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full relative">
                      {item.productImage && item.productImage.trim() !== '' ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image failed to load:', item.productImage);
                            // Fallback to emoji on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const emoji = document.createElement('span');
                              emoji.className = 'text-2xl sm:text-3xl absolute inset-0 flex items-center justify-center';
                              emoji.textContent = '🍽️';
                              parent.appendChild(emoji);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl absolute inset-0 flex items-center justify-center">🍽️</span>
                      )}
                    </div>
                  </div>

                  {/* Product Details - Separate column with guaranteed spacing */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate pr-2">{item.productName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{formatWeight(item.weight)}</p>
                    <p className="text-lg font-bold text-orange-600">₹{item.price}</p>
                  </div>

                  {/* Quantity Controls - Fixed width column */}
                  <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-600">Item total</span>
                  <span className="font-bold text-lg text-gray-900">₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 border-t gap-4">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 font-medium flex items-center transition-colors justify-center sm:justify-start"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </button>
              <Link
                href="/products"
                className="text-orange-500 hover:text-orange-600 font-medium flex items-center transition-colors justify-center sm:justify-start"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Shop More</span>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-pink-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📋</span>
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  
                  {subtotal < 500 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium flex items-center">
                        <span className="mr-2">🚚</span>
                        Add ₹{500 - subtotal} more for free delivery!
                      </p>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                        ₹{total}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-center block shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">💰</span>
                    <span>Cash on Delivery (COD) available</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⭐</span>
                    <span>Made fresh to order</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🚚</span>
                    <span>2-4 days delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cat Illustration */}
        <div className="text-center mt-12">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-gray-600">
            Thank you for choosing CozyCatKitchen! Your cat will love you for it! 😺
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <span className="text-2xl animate-pulse">🐾</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</span>
            <span className="text-2xl animate-ping" style={{ animationDelay: '0.4s' }}>🐾</span>
          </div>
        </div>
      </div>
    </div>
  )
}
