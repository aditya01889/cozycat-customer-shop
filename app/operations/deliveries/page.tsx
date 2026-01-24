'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Truck,
  User,
  FileText
} from 'lucide-react'

interface Delivery {
  id: string
  delivery_number: string
  order_id: string
  order_number: string
  batch_id: string
  batch_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_partner_id?: string
  delivery_partner_name?: string
  delivery_partner_phone?: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  estimated_delivery_date?: string
  actual_delivery_date?: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  items_count: number
  total_value: number
}

export default function DeliveryManagement() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      console.log('Fetching deliveries...')
      const { data, error } = await supabase
        .from('delivery_details_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('delivery_details_view not available, using fallback:', error.message)
        throw error
      }
      
      console.log('Deliveries data:', data)
      setDeliveries(data || [])
    } catch (error) {
      console.error('Error fetching deliveries:', error)
      
      // Fallback to basic query
      try {
        console.log('Fetching deliveries from delivery table...')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('deliveries')
          .select('*')
          .order('created_at', { ascending: false })

        if (fallbackError) {
          console.error('Error with fallback query:', fallbackError)
          throw fallbackError
        }
        
        console.log('Deliveries fallback data:', fallbackData)
        setDeliveries(fallbackData || [])
      } catch (fallbackError) {
        console.error('Error with fallback query:', fallbackError)
        setDeliveries([])
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_transit':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'assigned':
        return <User className="w-4 h-4" />
      case 'in_transit':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const handleCreateDelivery = async (batchId: string, orderId: string) => {
    try {
      // Generate delivery number
      const deliveryNumber = `DEL-${Date.now().toString().slice(-8)}`
      
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      // Create delivery
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          delivery_number: deliveryNumber,
          order_id: orderId,
          batch_id: batchId,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          delivery_address: orderData.delivery_address,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (deliveryError) throw deliveryError

      // Mark batch as delivery created
      await supabase
        .from('production_batches')
        .update({ delivery_created: true })
        .eq('id', batchId)

      await fetchDeliveries()
      showSuccess(`Delivery ${deliveryNumber} created successfully`, 'Delivery Created')
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating delivery:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create delivery'
      showError(new Error(errorMessage))
    }
  }

  const generateShippingSlip = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    showInfo('Shipping slip feature coming soon!', 'Coming Soon')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-sm text-gray-500">Manage order deliveries and shipping</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/operations/delivery-partners"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Manage Partners
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Delivery
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-indigo-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{delivery.delivery_number}</div>
                          <div className="text-sm text-gray-500">{delivery.order_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{delivery.customer_name}</div>
                        <div className="text-gray-500">{delivery.customer_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {delivery.delivery_partner_name ? (
                          <>
                            <div className="font-medium text-gray-900">{delivery.delivery_partner_name}</div>
                            <div className="text-gray-500">{delivery.delivery_partner_phone}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1">{delivery.status.replace('_', ' ').toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(delivery.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedDelivery(delivery)
                            setShowViewModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Delivery Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => generateShippingSlip(delivery)}
                          className="text-green-600 hover:text-green-900"
                          title="Generate Shipping Slip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
              <p className="text-gray-500">Get started by creating a new delivery from completed batches.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Delivery Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Number</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{selectedDelivery.delivery_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Number</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{selectedDelivery.order_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedDelivery.status)}`}>
                        {getStatusIcon(selectedDelivery.status)}
                        <span className="ml-1">{selectedDelivery.status.replace('_', ' ').toUpperCase()}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDelivery.tracking_number || 'Not generated'}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDelivery.customer_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDelivery.customer_email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDelivery.customer_phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDelivery.delivery_address}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Partner Information */}
                {selectedDelivery.delivery_partner_name && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Partner</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDelivery.delivery_partner_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDelivery.delivery_partner_phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created Date</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedDelivery.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedDelivery.updated_at).toLocaleDateString()}</p>
                    </div>
                    {selectedDelivery.estimated_delivery_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Delivery</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedDelivery.estimated_delivery_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedDelivery.actual_delivery_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Actual Delivery</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedDelivery.actual_delivery_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Delivery Modal */}
      {showCreateModal && (
        <CreateDeliveryModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDelivery}
        />
      )}
    </div>
  )
}

// Create Delivery Modal Component
function CreateDeliveryModal({ onClose, onCreate }: { 
  onClose: () => void
  onCreate: (batchId: string, orderId: string) => Promise<void>
}) {
  const [completedBatches, setCompletedBatches] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedBatches()
  }, [])

  const fetchCompletedBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('production_batches')
        .select(`
          id,
          batch_number,
          order_id,
          status,
          orders (
            id,
            order_number,
            customer_name,
            customer_email,
            customer_phone,
            delivery_address
          )
        `)
        .eq('status', 'completed')
        .is('delivery_created', false)

      if (error) throw error
      setCompletedBatches(data || [])
    } catch (error) {
      console.error('Error fetching completed batches:', error)
      setCompletedBatches([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedBatch) return
    
    await onCreate(selectedBatch.id, selectedBatch.order_id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Delivery</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {completedBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed batches available</h3>
                  <p className="text-gray-500">Complete some production batches first to create deliveries.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Completed Batch
                    </label>
                    <div className="space-y-2">
                      {completedBatches.map((batch) => (
                        <div
                          key={batch.id}
                          onClick={() => setSelectedBatch(batch)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedBatch?.id === batch.id 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{batch.batch_number}</div>
                              <div className="text-sm text-gray-500">Order: {batch.orders?.order_number}</div>
                              <div className="text-sm text-gray-500">Customer: {batch.orders?.customer_name}</div>
                            </div>
                            <CheckCircle 
                              className={`w-5 h-5 ${
                                selectedBatch?.id === batch.id 
                                  ? 'text-indigo-600' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedBatch && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Delivery Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Customer:</span> {selectedBatch.orders?.customer_name}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {selectedBatch.orders?.customer_phone}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Address:</span> {selectedBatch.orders?.delivery_address}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedBatch}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Delivery
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
