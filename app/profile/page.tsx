'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { User, Package, MapPin, Phone, Mail, Calendar, LogOut, Edit2, ArrowRight, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  delivery_notes?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  address?: {
    address_line1: string
    address_line2: string
    city: string
    state: string
    pincode: string
  }
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    try {
      console.log('Fetching orders for user:', user?.id)
      // Fetch orders for the current user
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          status, 
          total_amount, 
          created_at, 
          delivery_notes
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      console.log('Orders response:', { data, error })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
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
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    setDeleteLoading(true)
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Authentication error. Please sign in again.')
        return
      }

      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      if (response.ok) {
        toast.success('Account deleted successfully')
        setShowDeleteModal(false)
        // Sign out and redirect to home
        await signOut()
        window.location.href = '/'
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete account')
      }
    } catch (error) {
      toast.error('An error occurred while deleting your account')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Cat Illustration */}
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-4xl">🐾</span>
              </div>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>😿</div>
            </div>
            
            {/* Main Message */}
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Please Sign In
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              You need to be signed in to view your profile and track your cat's delicious meals! 🐾
            </p>
            
            {/* Call to Action */}
            <div className="space-y-4">
              <Link
                href="/auth"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
              >
                <span className="mr-3">🔑</span>
                Sign In to Your Account
                <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  <span>Track orders</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">📦</span>
                  <span>View profile</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">⭐</span>
                  <span>Save favorites</span>
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
                Your cat is waiting for you to sign in! 😺
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            My Profile
          </h1>
          <p className="text-xl text-gray-600">
            Manage your account and track your cat's favorite meals! 🐾
          </p>
        </div>

        {/* User Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
            <span className="mr-3">👤</span>
            Account Information
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Name</p>
                <p className="text-gray-600">{user?.user_metadata?.name || 'Cat Parent'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <p className="text-gray-600">{user?.email || 'cat@example.com'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Phone</p>
                <p className="text-gray-600">{user?.user_metadata?.phone || '+91-98736-48122'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Member Since</p>
                <p className="text-gray-600">
                  {user?.created_at ? formatDate(user.created_at) : 'January 2024'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
            <span className="mr-3">📦</span>
            My Orders
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full animate-spin">
                <span className="text-2xl">🔄</span>
              </div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😺</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
                  <p className="text-gray-600">
                    Your cat is waiting for delicious meals! Start shopping now!
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold"
                  >
                    <span className="mr-2">🍽️</span>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link 
                      key={order.id} 
                      href={`/orders/${order.id}`}
                      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">📦</span>
                            <div>
                              <h3 className="font-bold text-gray-800">#{order.order_number}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </p>
                            <p className="text-xs text-orange-600 font-medium mt-1">View Details →</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <User className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="text-sm text-gray-600">Customer</span>
                            </div>
                            <p className="font-medium text-gray-800">{user?.user_metadata?.name || 'Customer'}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            {user?.user_metadata?.phone && (
                              <p className="text-sm text-gray-500">{user.user_metadata.phone}</p>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-bold text-orange-600">₹{order.total_amount}</span>
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            {order.delivery_notes && !order.delivery_notes.includes('customer_name') && (
                              <p className="italic">"{order.delivery_notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
            <span className="mr-3">⚙️</span>
            Account Actions
          </h2>
          
          <div className="space-y-4">
            <Link
              href="/profile/edit"
              className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold"
            >
              <span className="mr-2">✏️</span>
              Edit Profile
            </Link>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center w-full px-6 py-3 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors font-medium"
            >
              <span className="mr-2">🗑️</span>
              Delete Account
            </button>
            
            <button
              onClick={signOut}
              className="flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </button>
          </div>
        </div>

        {/* Cat Illustration */}
        <div className="text-center mt-12">
          <div className="text-8xl mb-4">🐾</div>
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                Delete Account
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium mb-2">⚠️ This action cannot be undone</p>
                <p className="text-red-700 text-sm">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                  <li>Your profile information</li>
                  <li>Order history</li>
                  <li>Saved preferences</li>
                  <li>All account data</li>
                </ul>
              </div>

              <p className="text-gray-600 text-sm">
                Are you sure you want to delete your account? This action is permanent and cannot be recovered.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
