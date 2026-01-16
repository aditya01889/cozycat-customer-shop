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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-xl text-gray-600">
            Find out where your cat's delicious meal is! 🐾
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Where's Your Order?
            </h2>
            <p className="text-gray-600">
              Enter your order number to track your CozyCatKitchen delivery
            </p>
          </div>

          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., CC240123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-orange-300 border-t-transparent"></span>
                  <span className="ml-2">Tracking...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🔍</span>
                  Track Order
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Can't find your order? 
              <Link href="/contact" className="text-orange-500 hover:text-orange-600 font-semibold">
                Contact our cat support team! 🐾
              </Link>
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🕒️</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Order Confirmation</h3>
            <p className="text-sm text-gray-600">You'll receive WhatsApp confirmation within 4 hours</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Delivery Updates</h3>
            <p className="text-sm text-gray-600">We'll call to confirm delivery details</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Fresh Delivery</h3>
            <p className="text-sm text-gray-600">2-4 days after confirmation</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">❓</span>
            Common Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">🤔</span>
                How do I find my order number?
              </h3>
              <p className="text-sm text-gray-600">Check your order confirmation email or WhatsApp message for your order number.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">⏰</span>
                What if I'm not home for delivery?
              </h3>
              <p className="text-sm text-gray-600">We'll call before delivery. If you're not available, we'll reschedule for a convenient time.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">📱</span>
                Can I change my order after placing it?
              </h3>
              <p className="text-sm text-gray-600">Yes! Contact us within 2 hours of placing your order for any changes.</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-orange-500 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            <span className="mr-2">🏠</span>
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
