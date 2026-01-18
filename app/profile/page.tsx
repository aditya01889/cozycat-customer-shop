'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { User, Package, MapPin, Phone, Mail, Calendar, LogOut, Edit2, ArrowRight, AlertTriangle, X, CreditCard, Home } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast/ToastProvider'
import { ErrorHandler, ErrorType } from '@/lib/errors/error-handler'
import SimpleAddressManager from '@/components/SimpleAddressManager'
import PaymentMethodManager from '@/components/PaymentMethodManager'

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

interface Address {
  id: string
  address_line1: string
  address_line2: string
  landmark: string
  city: string
  state: string
  pincode: string
  latitude: number | null
  longitude: number | null
  is_default: boolean
  delivery_notes: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'wallet'
  provider: string
  last_four?: string
  brand?: string
  expiry_month?: number
  expiry_year?: number
  upi_id?: string
  wallet_name?: string
  is_default: boolean
  created_at: string
}

interface Profile {
  full_name: string
  phone: string | null
  email: string | null
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'payments'>('orders')
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchUserOrders()
      fetchUserAddresses()
      fetchUserPaymentMethods()
    }
  }, [user])

  const fetchUserAddresses = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Profile - Addresses fetch session:', { session: !!session, userId: session?.user?.id, sessionError })
      
      if (!session?.access_token) {
        console.error('No session token available')
        return
      }

      const response = await fetch('/api/user/addresses', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.addresses || [])
      } else {
        console.error('Error fetching addresses:', data.error)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const fetchUserPaymentMethods = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Profile - Payment methods fetch session:', { session: !!session, userId: session?.user?.id, sessionError })
      
      if (!session?.access_token) {
        console.error('No session token available')
        return
      }

      const response = await fetch('/api/user/payment-methods', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods || [])
      } else {
        console.error('Error fetching payment methods:', data.error)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

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

  const handleAddAddress = async (address: Omit<Address, 'id'>) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('No valid session')
      }

      console.log('Adding address:', address)

      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify(address)
      })

      const data = await response.json()
      console.log('Add address response:', data)
      console.log('Error details:', data.details)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add address')
      }

      await fetchUserAddresses()
      showSuccess('Address added successfully!')
    } catch (error) {
      console.error('Error adding address:', error)
      const appError = ErrorHandler.fromError(error, 'address management')
      showError(appError)
    }
  }

  const handleUpdateAddress = async (id: string, address: Partial<Address>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'address management'
        ))
        return
      }

      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(address)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAddresses(prev => prev.map(addr => 
          addr.id === id ? { ...addr, ...address } : addr
        ))
        showSuccess('Address updated successfully!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to update address',
          null,
          400,
          'address management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'address management')
      showError(appError)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'address management'
        ))
        return
      }

      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== id))
        showSuccess('Address deleted successfully!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to delete address',
          null,
          400,
          'address management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'address management')
      showError(appError)
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'address management'
        ))
        return
      }

      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ is_default: true })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAddresses(prev => prev.map(addr => 
          ({ ...addr, is_default: addr.id === id })
        ))
        showSuccess('Default address updated!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to set default address',
          null,
          400,
          'address management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'address management')
      showError(appError)
    }
  }

  const handleAddPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'created_at'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'payment method management'
        ))
        return
      }

      const response = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(method)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(prev => [...prev, data.paymentMethod])
        showSuccess('Payment method added successfully!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to add payment method',
          null,
          400,
          'payment method management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'payment method management')
      showError(appError)
    }
  }

  const handleUpdatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'payment method management'
        ))
        return
      }

      const response = await fetch(`/api/user/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(method)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(prev => prev.map(pm => 
          pm.id === id ? { ...pm, ...method } : pm
        ))
        showSuccess('Payment method updated successfully!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to update payment method',
          null,
          400,
          'payment method management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'payment method management')
      showError(appError)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'payment method management'
        ))
        return
      }

      const response = await fetch(`/api/user/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== id))
        showSuccess('Payment method deleted successfully!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to delete payment method',
          null,
          400,
          'payment method management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'payment method management')
      showError(appError)
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        showError(ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'payment method management'
        ))
        return
      }

      const response = await fetch(`/api/user/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ is_default: true })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(prev => prev.map(pm => 
          ({ ...pm, is_default: pm.id === id })
        ))
        showSuccess('Default payment method updated!')
      } else {
        showError(ErrorHandler.createError(
          ErrorType.VALIDATION,
          data.error || 'Failed to set default payment method',
          null,
          400,
          'payment method management'
        ))
      }
    } catch (error) {
      const appError = ErrorHandler.fromError(error, 'payment method management')
      showError(appError)
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
        const error = ErrorHandler.createError(
          ErrorType.AUTHENTICATION,
          'Authentication error. Please sign in again.',
          null,
          401,
          'profile authentication'
        )
        showError(error)
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
        showSuccess('Account deleted successfully')
        setShowDeleteModal(false)
        // Sign out and redirect to home
        await signOut()
        window.location.href = '/'
      } else {
        const error = await response.json()
        const appError = ErrorHandler.fromError(error, 'account deletion')
        showError(appError)
      }
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
                <p className="text-gray-600">{profile?.full_name || 'Cat Parent'}</p>
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
                <p className="text-gray-600">{profile?.phone || '+91-98736-48122'}</p>
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-1 border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'orders' 
                  ? 'text-orange-600 border-orange-600' 
                  : 'text-gray-600 hover:text-orange-600 border-transparent'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'addresses' 
                  ? 'text-orange-600 border-orange-600' 
                  : 'text-gray-600 hover:text-orange-600 border-transparent'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'payments' 
                  ? 'text-orange-600 border-orange-600' 
                  : 'text-gray-600 hover:text-orange-600 border-transparent'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
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
                        href={`/orders/${order.id}?from=profile`}
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
                              <p className="font-medium text-gray-800">{profile?.full_name || 'Customer'}</p>
                              <p className="text-sm text-gray-500">{user?.email}</p>
                              {profile?.phone && (
                                <p className="text-sm text-gray-500">{profile.phone}</p>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Total Amount</span>
                              <span className="font-bold text-orange-600">₹{order.total_amount}</span>
                            </div>
                            
                            <div className="text-right text-sm text-gray-500">
                              {order.delivery_notes && !order.delivery_notes.includes("customer_name") && (
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
        )}

        {activeTab === 'addresses' && (
          <SimpleAddressManager
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onUpdateAddress={handleUpdateAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentMethodManager
            paymentMethods={paymentMethods}
            onAddPaymentMethod={handleAddPaymentMethod}
            onUpdatePaymentMethod={handleUpdatePaymentMethod}
            onDeletePaymentMethod={handleDeletePaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
          />
        )}

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
