'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import Link from 'next/link'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Eye,
  Calendar,
  User,
  Phone,
  MapPin,
  IndianRupee,
  AlertTriangle
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  delivery_notes: string
  customer_info?: {
    customer_name: string
    customer_phone: string
    customer_email: string
    address_line1: string
    city: string
    state: string
    pincode: string
  }
  order_items: Array<{
    id: string
    product_name: string
    quantity: number
    weight_grams: number
    unit_price: number
    total_price: number
  }>
}

export default function ProductionQueue() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [operationsUser, setOperationsUser] = useState<any>(null)

  useEffect(() => {
    checkOperationsAccess()
    fetchProductionQueue()
  }, [])

  const checkOperationsAccess = async () => {
    const opsUser = await getOperationsUserClient()
    if (!opsUser) {
      window.location.href = '/'
      return
    }
    setOperationsUser(opsUser)
  }

  const fetchProductionQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            product_variant:product_variants (
              weight_grams,
              product:products (name)
            )
          )
        `)
        .in('status', ['pending', 'confirmed', 'ready_production'])
        .order('created_at', { ascending: true })

      if (error) throw error

      // Parse delivery_notes and format order items
      const formattedOrders = (data || []).map((order: any) => ({
        ...order,
        customer_info: order.delivery_notes ? JSON.parse(order.delivery_notes) : null,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          product_name: item.product_variant?.product?.name || 'Unknown Product',
          weight_grams: item.product_variant?.weight_grams || 0
        }))
      }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error('Error fetching production queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Add timestamps for specific status changes
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
        updateData.confirmed_by = user?.id
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      // Refresh the queue
      await fetchProductionQueue()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ready_production': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading production queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/operations" className="text-gray-600 hover:text-gray-900 mr-4">
                ← Back to Dashboard
              </Link>
              <span className="text-2xl mr-3">🏭</span>
              <h1 className="text-xl font-bold text-gray-900">Production Queue</h1>
            </div>
            <div className="text-sm text-gray-600">
              {orders.length} orders in queue
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Queue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'confirmed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ready for Production</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ready_production').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders in Production Queue</h3>
              <p className="text-gray-600">All orders are being processed or delivered!</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">#{order.order_number}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">₹{order.total_amount}</span>
                      <Link
                        href={`/orders/${order.order_number}?from=operations`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                {order.customer_info && (
                  <div className="p-6 border-b bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">{order.customer_info.customer_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium">{order.customer_info.customer_phone}</span>
                      </div>
                      <div className="flex items-center md:col-span-2">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Address:</span>
                        <span className="ml-2 font-medium">
                          {order.customer_info.address_line1}, {order.customer_info.city}, {order.customer_info.state} - {order.customer_info.pincode}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {item.quantity} × {item.weight_grams}g
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.status === 'pending' && 'Order needs confirmation before production'}
                      {order.status === 'confirmed' && 'Order confirmed, ready for production planning'}
                      {order.status === 'ready_production' && 'Order ready to start production'}
                    </div>
                    <div className="flex items-center space-x-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          disabled={updatingOrder === order.id}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {updatingOrder === order.id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Confirm Order
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready_production')}
                          disabled={updatingOrder === order.id}
                          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                        >
                          {updatingOrder === order.id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          Ready for Production
                        </button>
                      )}
                      
                      {order.status === 'ready_production' && (
                        <Link
                          href={`/operations/batches/create?order=${order.id}`}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Create Production Batch
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
