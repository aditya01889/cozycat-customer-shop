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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-600 mb-2">
          Thank you for choosing CozyCatKitchen
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Order #{orderNumber}
        </p>

        {/* Order Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto mb-8">
          <div className="flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">What's Next?</h2>
          <div className="text-left space-y-3 text-sm text-gray-600">
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
        <div className="bg-orange-50 rounded-lg p-6 max-w-md mx-auto mb-8">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Track Your Order
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Use your order number to track the status of your order in real-time.
          </p>
          <Link
            href={`/orders/${orderNumber}`}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium"
          >
            Track Order #{orderNumber}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Contact Options */}
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
          <h3 className="font-semibold mb-4">Need Help?</h3>
          <div className="space-y-3">
            <a
              href="tel:+919873648122"
              className="flex items-center justify-center text-orange-500 hover:text-orange-600"
            >
              <Phone className="w-5 h-5 mr-2" />
              +91-98736-48122
            </a>
            <a
              href="https://wa.me/919873648122"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-green-600 hover:text-green-700"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
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
