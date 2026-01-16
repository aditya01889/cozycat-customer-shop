'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Phone, MessageCircle, ArrowRight } from 'lucide-react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    // Get order number from URL params or generate a mock one
    const orderFromUrl = searchParams.get('order')
    if (orderFromUrl) {
      setOrderNumber(orderFromUrl)
    } else {
      // Generate a mock order number
      setOrderNumber('CC' + new Date().getFullYear().toString().slice(-2) + 
                    String(Math.floor(Math.random() * 1000000)).padStart(6, '0'))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <span className="text-5xl">🎉</span>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for choosing CozyCatKitchen 🐾
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Order #{orderNumber}
          </p>
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto mb-8">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">What's Next?</h2>
          <div className="text-left space-y-4 text-gray-600">
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">1.</span>
              <span>You'll receive a WhatsApp confirmation within 4 hours</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">2.</span>
              <span>Our team will call to confirm your order details</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">3.</span>
              <span>Fresh food will be prepared after confirmation</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">4.</span>
              <span>Order will be delivered in 2-4 days</span>
            </div>
          </div>
        </div>

        {/* Order Tracking Link */}
        <div className="bg-orange-50 rounded-2xl p-8 max-w-md mx-auto mb-8">
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            Track Your Order
          </h3>
          <p className="text-gray-700 mb-6">
            Use your order number to track the status of your order in real-time.
          </p>
          <Link
            href={`/orders/${orderNumber}`}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold"
          >
            <span className="mr-2">🔍</span>
            Track Order #{orderNumber}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Contact Options */}
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">💬</span>
            Need Help?
          </h3>
          <div className="space-y-4">
            <a
              href="tel:+919873648122"
              className="flex items-center justify-center p-3 bg-white rounded-lg text-orange-500 hover:text-orange-600 hover:shadow-md transition-all"
            >
              <span className="mr-2">📞</span>
              +91-98736-48122
            </a>
            <a
              href="https://wa.me/919873648122"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 bg-white rounded-lg text-green-600 hover:text-green-700 hover:shadow-md transition-all"
            >
              <span className="mr-2">💬</span>
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold"
          >
            <span className="mr-2">🍽️</span>
            Continue Shopping
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 bg-white text-orange-500 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-bold border-2 border-orange-200"
          >
            <span className="mr-2">🏠</span>
            Back to Home
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Cat Illustration */}
        <div className="text-center mt-12">
          <div className="text-8xl mb-4">🐾</div>
          <p className="text-gray-600">
            Your cat is going to love these fresh meals! 
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <span className="text-2xl animate-pulse">🐾</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</span>
            <span className="text-2xl animate-ping" style={{ animationDelay: '0.4s' }}>🐾</span>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-12 text-xs text-gray-500 max-w-md mx-auto">
          <p className="mb-2">
            <strong>Important:</strong> All our food is made fresh to order. 
            Please ensure someone is available to receive the call for order confirmation.
          </p>
          <p>
            Delivery timing may vary based on your location and current order volume.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
