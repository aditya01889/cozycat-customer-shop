'use client'

import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart, Truck, Clock, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CartSummaryProps {
  showCheckoutButton?: boolean
  showTitle?: boolean
  compact?: boolean
}

export default function CartSummary({ 
  showCheckoutButton = true, 
  showTitle = true, 
  compact = false 
}: CartSummaryProps) {
  const { 
    getTotalItems, 
    getSubtotal, 
    getDeliveryFee, 
    getTotal, 
    getAmountForFreeDelivery, 
    isFreeDelivery,
    hasItems,
    meetsMinimumOrder,
    getMinimumOrderMessage
  } = useCartStore()

  const subtotal = getSubtotal()
  const deliveryFee = getDeliveryFee()
  const total = getTotal()
  const amountForFreeDelivery = getAmountForFreeDelivery()
  const freeDelivery = isFreeDelivery()
  const totalItems = getTotalItems()
  const meetsMinOrder = meetsMinimumOrder()
  const minOrderMessage = getMinimumOrderMessage()

  if (!hasItems()) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-4">Add some delicious meals for your cat!</p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
        >
          Browse Products
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {showTitle && (
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-pink-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
            Order Summary
          </h2>
        </div>
      )}
      
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            <span className="font-medium">₹{subtotal}</span>
          </div>
          
          <div className="flex justify-between text-gray-700">
            <span>Delivery Fee</span>
            <span className={`font-medium ${freeDelivery ? 'text-green-600' : ''}`}>
              {freeDelivery ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>
          
          {!freeDelivery && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Add ₹{amountForFreeDelivery} more for free delivery!
              </p>
            </div>
          )}

          {!meetsMinOrder && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {minOrderMessage}
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

        {showCheckoutButton && (
          <Link
            href="/checkout"
            className={`w-full py-4 px-6 rounded-2xl font-bold text-center block shadow-lg transition-all duration-300 transform hover:scale-105 ${
              meetsMinOrder 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!meetsMinOrder) {
                e.preventDefault()
              }
            }}
          >
            {meetsMinOrder ? (
              <>
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 ml-2 inline" />
                Minimum Order Not Met
              </>
            )}
          </Link>
        )}

        {!compact && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="w-4 h-4 mr-2 text-orange-500" />
              <span>{freeDelivery ? 'Free delivery' : '2-4 days delivery'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>Made fresh to order</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
