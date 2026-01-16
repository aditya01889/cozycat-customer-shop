'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { User, Package, MapPin, Phone, Mail, Calendar, LogOut, Edit2 } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  delivery_notes?: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    try {
      // Fetch orders with customer info from profiles table
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          status, 
          total_amount, 
          created_at, 
          delivery_notes,
          customers!inner (
            profiles!inner (
              full_name,
              email
            )
          )
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-orange-600 bg-orange-50'
      case 'confirmed':
        return 'text-blue-600 bg-blue-50'
      case 'in_production':
        return 'text-purple-600 bg-purple-50'
      case 'ready':
        return 'text-green-600 bg-green-50'
      case 'out_for_delivery':
        return 'text-indigo-600 bg-indigo-50'
      case 'delivered':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to view your profile.</p>
          <Link
            href="/auth"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account and view order history</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.user_metadata?.name || 'User'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
              <Link
                href="/track-order"
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Track Order
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="mt-2 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">Order #{order.order_number}</h4>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">₹{order.total_amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Link
                        href={`/orders/${order.order_number}`}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                      >
                        View Details
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                          Order Again
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/products"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Shop Products</p>
                  <p className="text-sm text-gray-600">Browse our menu</p>
                </div>
              </Link>
              <Link
                href="/track-order"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Track Order</p>
                  <p className="text-sm text-gray-600">Check status</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
