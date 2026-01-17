'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Search, ArrowRight, Clock, Calendar, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchRecentOrders()
    }
  }, [user])

  const fetchRecentOrders = async () => {
    if (!user) return
    
    setLoadingOrders(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentOrders(data || [])
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderNumber.trim()) {
      setIsSearching(true)
      // Redirect to the order tracking page
      router.push(`/orders/${orderNumber.trim()}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'confirmed':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'in_production':
        return 'text-purple-700 bg-purple-100 border-purple-200'
      case 'ready':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'delivered':
        return 'text-gray-700 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
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

        {/* Recent Orders Section - Only for logged-in users */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🐾</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Recent Orders
              </h2>
              <p className="text-gray-600">
                Click on any order to track its status
              </p>
            </div>

            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.order_number}?from=track-order`}
                    className="block p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900">
                              {order.order_number}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(order.created_at)}
                            </span>
                            <span className="flex items-center">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              {order.total_amount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                >
                  <span className="mr-2">🛍️</span>
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}

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
