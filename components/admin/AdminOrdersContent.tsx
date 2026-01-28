'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Package, Search, Filter, ArrowUpDown, Eye, Edit, Trash2, Clock, CheckCircle, Truck, Home } from 'lucide-react'
import Link from 'next/link'

type OrderLifecycle = Database['public']['Tables']['orders']['Row'] & {
  order_status?: string;
  production_status?: string;
  delivery_status?: string;
  production_batch_id?: string;
  delivery_id?: string;
  customer_status?: string;
  last_activity_at?: string;
  customer_name?: string;
  customer_email?: string;
  order_created_at?: string;
  order_updated_at?: string;
}

export default function AdminOrdersContent() {
  const [orders, setOrders] = useState<OrderLifecycle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderLifecycle | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('order_lifecycle_view')
        .select('*')
        .order('order_created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || order.order_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortBy as keyof OrderLifecycle] || ''
    let bValue: any = b[sortBy as keyof OrderLifecycle] || ''
    
    if (sortBy === 'order_created_at' || sortBy === 'created_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_production': return 'bg-purple-100 text-purple-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'in_production': return <Package className="h-4 w-4" />
      case 'ready': return <CheckCircle className="h-4 w-4" />
      case 'out_for_delivery': return <Truck className="h-4 w-4" />
      case 'delivered': return <Home className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If same column, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // If different column, set new column and default to asc
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500">Manage customer orders and fulfillment</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {sortedOrders.length} of {orders.length} orders
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('order_number')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Order
                      {sortBy === 'order_number' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'order_number' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('customer_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Customer
                      {sortBy === 'customer_name' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'customer_name' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('order_status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'order_status' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'order_status' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('total_amount')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Amount
                      {sortBy === 'total_amount' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'total_amount' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('order_created_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'order_created_at' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'order_created_at' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_number || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.id?.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_name || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer_email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status || '')}`}>
                        {getStatusIcon(order.order_status || '')}
                        <span className="ml-1">{order.order_status || 'Unknown'}</span>
                      </span>
                      {order.production_status && (
                        <div className="text-xs text-gray-500 mt-1">
                          Production: {order.production_status}
                        </div>
                      )}
                      {order.delivery_status && (
                        <div className="text-xs text-gray-500">
                          Delivery: {order.delivery_status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.order_created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowViewModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Orders will appear here when customers place them'}
            </p>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-500">
                    Order #{selectedOrder.order_number || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedOrder.customer_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedOrder.customer_email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedOrder.customer_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.order_status || '')}`}>
                        {getStatusIcon(selectedOrder.order_status || '')}
                        <span className="ml-1">{selectedOrder.order_status || 'Unknown'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Amount:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {formatCurrency(selectedOrder.total_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Order Date:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {formatDate(selectedOrder.order_created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Production Status */}
                {selectedOrder.production_status && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Production Status</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedOrder.production_status}</span>
                      </div>
                      {selectedOrder.production_batch_id && (
                        <div>
                          <span className="text-sm text-gray-500">Batch ID:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedOrder.production_batch_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Status */}
                {selectedOrder.delivery_status && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Status</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedOrder.delivery_status}</span>
                      </div>
                      {selectedOrder.delivery_id && (
                        <div>
                          <span className="text-sm text-gray-500">Delivery ID:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedOrder.delivery_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
