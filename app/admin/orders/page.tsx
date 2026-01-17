'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import AdminAuth from '@/components/AdminAuth'
import { Package, Search, Filter, ArrowUpDown, Eye, Edit, Trash2, Clock, CheckCircle, Truck, Home } from 'lucide-react'
import Link from 'next/link'

type Order = Database['public']['Tables']['orders']['Row']

export default function AdminOrdersPage() {
  return (
    <AdminAuth>
      <AdminOrdersContent />
    </AdminAuth>
  )
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, filterStatus, sortBy, sortOrder])

  const fetchOrders = async () => {
    try {
      console.log('Fetching admin orders...')
      let query = supabase
        .from('orders')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%`)
      }

      // Apply status filter
      if (filterStatus) {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      console.log('Admin orders data:', data)
      console.log('Admin orders error:', error)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', orderId, newStatus)
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus as Order['status'] })
        .eq('id', orderId)

      if (error) throw error
      
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      )
      
      // Update selected order if it's currently open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null)
      }
      
      console.log('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const parseCustomerInfo = (deliveryNotes: string | null) => {
    if (!deliveryNotes) return null
    try {
      const parsed = JSON.parse(deliveryNotes)
      return typeof parsed === 'object' ? parsed : null
    } catch (e) {
      return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_production': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'ready': return 'bg-green-100 text-green-700 border-green-200'
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'delivered': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'in_production': return <Package className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'out_for_delivery': return <Truck className="w-4 h-4" />
      case 'delivered': return <Home className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <span className="text-lg mr-2">←</span>
                Back to Dashboard
              </Link>
              <span className="text-2xl mr-3">🐾</span>
              <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Orders</h2>
          <p className="text-gray-600">Manage customer orders and track delivery status</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by order number..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="created_at">Date</option>
                  <option value="order_number">Order Number</option>
                  <option value="total_amount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-orange-500 mr-2" />
                          <span className="font-medium text-gray-900">#{order.order_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(() => {
                            const customerInfo = parseCustomerInfo(order.delivery_notes)
                            if (customerInfo && customerInfo.customer_name) {
                              return customerInfo.customer_name
                            } else {
                              return `Customer ID: ${order.customer_id || 'N/A'}`
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">₹{order.total_amount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/orders/${order.order_number}?from=admin`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                            title="Quick View & Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.order_number}</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Information</label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-semibold">#{selectedOrder.order_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                              {getStatusIcon(selectedOrder.status)}
                              <span className="ml-1">{selectedOrder.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold text-green-600">₹{selectedOrder.total_amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className="font-medium">{selectedOrder.payment_status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">{selectedOrder.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Information</label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {(() => {
                            const customerInfo = parseCustomerInfo(selectedOrder.delivery_notes)
                            if (customerInfo) {
                              return (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Customer Name:</span>
                                    <span className="font-medium">{customerInfo.customer_name || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{customerInfo.customer_phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{customerInfo.customer_email || 'N/A'}</span>
                                  </div>
                                  {customerInfo.customer_whatsapp && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">WhatsApp:</span>
                                      <span className="font-medium">{customerInfo.customer_whatsapp}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">
                                      {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </>
                              )
                            } else {
                              return null // Don't show redundant Customer ID when we have structured data
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {(() => {
                            const customerInfo = parseCustomerInfo(selectedOrder.delivery_notes)
                            if (customerInfo && (customerInfo.address_line1 || customerInfo.city)) {
                              return (
                                <div>
                                  <span className="text-gray-600 block mb-2">Delivery Address:</span>
                                  <div className="bg-white rounded p-3 border border-gray-200">
                                    <div className="text-sm text-gray-800">
                                      {customerInfo.address_line1 && (
                                        <div>{customerInfo.address_line1}</div>
                                      )}
                                      {customerInfo.address_line2 && (
                                        <div>{customerInfo.address_line2}</div>
                                      )}
                                      {customerInfo.landmark && (
                                        <div className="text-gray-600">Landmark: {customerInfo.landmark}</div>
                                      )}
                                      <div>
                                        {customerInfo.city && <span>{customerInfo.city}</span>}
                                        {customerInfo.state && <span>, {customerInfo.state}</span>}
                                        {customerInfo.pincode && <span> - {customerInfo.pincode}</span>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            
                            if (customerInfo && customerInfo.delivery_notes) {
                              return (
                                <div>
                                  <span className="text-gray-600 block mb-1">Delivery Notes:</span>
                                  <div className="text-sm text-gray-800">{customerInfo.delivery_notes}</div>
                                </div>
                              )
                            }
                            
                            if (selectedOrder.notes && !customerInfo) {
                              return (
                                <div>
                                  <span className="text-gray-600 block mb-1">Order Notes:</span>
                                  <div className="text-sm text-gray-800">{selectedOrder.notes}</div>
                                </div>
                              )
                            }
                            
                            if (selectedOrder.delivery_address_id && !customerInfo) {
                              return (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Delivery Address ID:</span>
                                  <span className="font-medium">{selectedOrder.delivery_address_id}</span>
                                </div>
                              )
                            }
                            
                            return null
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Update Order Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'confirmed', 'in_production', 'ready_production', 'ready_delivery', 'out_for_delivery', 'delivered'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selectedOrder.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                        >
                          {status.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
