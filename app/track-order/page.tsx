'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderNumber.trim()) {
      setIsSearching(true)
      // Redirect to the order tracking page
      router.push(`/orders/${orderNumber.trim()}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        {/* Header */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-orange-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Track Your Order
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter your order number to get real-time updates on your CozyCatKitchen order status
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto mb-12">
        <form onSubmit={handleTrackOrder} className="space-y-6">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter your order number (e.g., CC2025123456)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
              />
              <Package className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              You can find your order number in the confirmation email or SMS
            </p>
          </div>

          <button
            type="submit"
            disabled={!orderNumber.trim() || isSearching}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSearching ? (
              'Tracking...'
            ) : (
              <>
                <Search className="w-5 h-5" />
                Track Order
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Help Section */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Can't find your order number?
          </h3>
          <p className="text-gray-700 mb-4">
            Check your email or SMS for the order confirmation. The order number typically starts with "CC" followed by numbers.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Check your spam/junk folder</p>
            <p>• Look for messages from "cozycatkitchen.com"</p>
            <p>• Search for "CozyCatKitchen Order"</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            If you're having trouble tracking your order, our support team is here to help.
          </p>
          <div className="space-y-3">
            <a
              href="tel:+919873648122"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              Call: +91-98736-48122
            </a>
            <br />
            <a
              href="mailto:orders@cozycatkitchen.com"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              Email: orders@cozycatkitchen.com
            </a>
          </div>
        </div>
      </div>

      {/* Order Status Examples */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
        <h3 className="font-semibold text-lg mb-4">Order Status Updates</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="font-medium">Order Received</span>
            <span className="text-gray-600">- We've got your order</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-medium">Order Confirmed</span>
            <span className="text-gray-600">- Order verified and processing</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="font-medium">Being Prepared</span>
            <span className="text-gray-600">- Fresh food being made</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">Ready for Delivery</span>
            <span className="text-gray-600">- Order packed and ready</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span className="font-medium">Out for Delivery</span>
            <span className="text-gray-600">- On the way to you</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="font-medium">Delivered</span>
            <span className="text-gray-600">- Order completed</span>
          </div>
        </div>
      </div>

      {/* Back to Shopping */}
      <div className="text-center mt-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
