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
import OperationsPageHeader from '@/components/operations/OperationsPageHeader'

interface Delivery {
  id: string
  delivery_number: string
  order_id: string
  order_number?: string
  delivery_partner_id?: string
  tracking_number?: string
  delivery_status: string
  created_at: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  delivery_address?: string
  delivery_partner_name?: string
  delivery_partner_phone?: string
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
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      console.log('Fetching deliveries...')
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching deliveries:', error)
        showError('Failed to fetch deliveries')
        setDeliveries([])
        return
      }
      
      console.log('Raw deliveries data:', data)
      
      // Fetch customer data for each delivery
      const deliveriesWithCustomerData = await Promise.all(
        (data || []).map(async (delivery) => {
          if (delivery.order_id) {
            try {
              // Get order with customer info
              const { data: orderData } = await supabase
                .from('orders')
                .select('order_number, customer_id, delivery_address_id, total_amount')
                .eq('id', delivery.order_id)
                .single()
              
              // Get order items count
              let itemsCount = 0
              if (orderData) {
                const { data: orderItems } = await supabase
                  .from('order_items')
                  .select('id')
                  .eq('order_id', delivery.order_id)
                itemsCount = orderItems?.length || 0
              }
              
              console.log('Processing delivery:', delivery.id, 'for order:', delivery.order_id)
              console.log('Full order data:', orderData)
              
              let deliveryAddress = 'Address not available'
              
              // Try different possible address fields
              if (orderData?.delivery_address_id) {
                console.log('Fetching address for delivery_address_id:', orderData.delivery_address_id)
                const { data: addressData } = await supabase
                  .from('customer_addresses')
                  .select('address_line1, address_line2, city, state, pincode')
                  .eq('id', orderData.delivery_address_id)
                  .single()
                
                if (addressData) {
                  deliveryAddress = `${addressData.address_line1}, ${addressData.city}, ${addressData.state} ${addressData.pincode}`
                }
              } else if (orderData?.customer_id) {
                // Try to get any address for the customer (simplified query)
                console.log('Trying to get any address for customer:', orderData.customer_id)
                const { data: anyAddressData } = await supabase
                  .from('customer_addresses')
                  .select('*')
                  .eq('customer_id', orderData.customer_id)
                  .limit(1)
                
                console.log('Address query result:', anyAddressData)
                
                if (anyAddressData && anyAddressData.length > 0) {
                  const address = anyAddressData[0]
                  deliveryAddress = `${address.address_line1}, ${address.city || ''}, ${address.state || ''} ${address.pincode || ''}`.trim()
                  console.log('Found and formatted address for delivery', delivery.id, ':', deliveryAddress)
                } else {
                  console.log('No address found for customer:', orderData.customer_id)
                }
              }
              
              if (orderData?.customer_id) {
                // Get customer info
                const { data: customerData } = await supabase
                  .from('customers')
                  .select('profile_id')
                  .eq('id', orderData.customer_id)
                  .single()
                
                if (customerData?.profile_id) {
                  // Get profile info
                  const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, email, phone')
                    .eq('id', customerData.profile_id)
                    .single()
                  
                  if (profileData) {
                    return {
                      ...delivery,
                      order_number: orderData.order_number,
                      customer_name: profileData.full_name,
                      customer_email: profileData.email,
                      customer_phone: profileData.phone,
                      delivery_address: deliveryAddress,
                      items_count: itemsCount,
                      total_value: parseFloat(orderData.total_amount) || 0
                    }
                  }
                }
              }
              
              // Even if customer data is not found, still include the address if available
              const finalDeliveryData = {
                ...delivery,
                order_number: orderData?.order_number,
                delivery_address: deliveryAddress,
                items_count: itemsCount,
                total_value: parseFloat(orderData?.total_amount) || 0,
                delivery_status: delivery.status  // Map status to delivery_status for UI compatibility
              }
              console.log('Final delivery data for', delivery.id, ':', finalDeliveryData)
              console.log('Specifically - delivery_address:', finalDeliveryData.delivery_address)
              return finalDeliveryData
            } catch (err) {
              console.log('Failed to fetch customer data for delivery:', delivery.id, err)
            }
          }
          return delivery
        })
      )
      
      // Ensure all deliveries have the delivery_status field mapped from status
      const deliveriesWithStatusMapping = deliveriesWithCustomerData.map(delivery => ({
        ...delivery,
        delivery_status: delivery.status  // Always map status to delivery_status
      }))
      
      console.log('Enriched deliveries data:', deliveriesWithStatusMapping)
      setDeliveries(deliveriesWithStatusMapping)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
      showError('Failed to fetch deliveries')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPartner = async (partnerId: string) => {
    if (!selectedDelivery) {
      console.log('No selected delivery')
      return
    }
    
    try {
      console.log('Starting partner assignment:', { partnerId, deliveryId: selectedDelivery.id })
      
      // Generate tracking number if not exists
      const trackingNumber = selectedDelivery.tracking_number || `TRK-${Date.now()}`
      
      // Get partner details
      const { data: partnerData, error: partnerError } = await supabase
        .from('delivery_partners')
        .select('name, contact_phone')
        .eq('id', partnerId)
        .single()
      
      if (partnerError) {
        console.error('Partner error:', partnerError)
        throw partnerError
      }
      
      console.log('Partner data:', partnerData)
      
      // Update delivery with partner info and tracking number
      const { error: updateError } = await supabase
        .from('deliveries')
        .update({
          delivery_partner_id: partnerId,
          delivery_partner_name: partnerData.name,
          delivery_partner_phone: partnerData.contact_phone,
          delivery_status: 'scheduled',
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDelivery.id)
      
      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }
      
      console.log('Partner assignment successful with tracking number:', trackingNumber)
      showSuccess(`Delivery partner assigned successfully! Tracking number: ${trackingNumber}`)
      setShowAssignModal(false)
      setSelectedPartnerId('')
      fetchDeliveries() // Refresh data
    } catch (error) {
      console.error('Error assigning partner:', error)
      showError('Failed to assign delivery partner')
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedDelivery) return
    
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDelivery.id)
      
      if (error) throw error
      
      showSuccess('Delivery status updated successfully!')
      setShowStatusModal(false)
      setSelectedStatus('')
      fetchDeliveries() // Refresh data
    } catch (error) {
      console.error('Error updating status:', error)
      showError('Failed to update delivery status')
    }
  }

  const formatDeliveryNumber = (deliveryNumber: string) => {
    // Remove UUID suffix if present (everything after the last dash after time)
    // Format: DEL-2026-01-24-176927-24f8a2da -> DEL-2026-01-24-176927
    const parts = deliveryNumber.split('-')
    if (parts.length >= 5) {
      // Remove the last part (UUID suffix)
      return parts.slice(0, -1).join('-')
    }
    return deliveryNumber
  }

  const generateShippingSlip = (delivery: Delivery) => {
    // Generate tracking number if not exists
    const trackingNumber = delivery.tracking_number || `TRK${Date.now()}`
    
    // Create shipping slip content
    const slipContent = `
SHIPPING SLIP
==============
Delivery Number: ${formatDeliveryNumber(delivery.delivery_number)}
Order Number: ${delivery.order_number || `Order: ${delivery.order_id?.slice(0, 8)}...`}
Tracking Number: ${trackingNumber}

Customer Information:
Name: ${delivery.customer_name || 'N/A'}
Email: ${delivery.customer_email || 'N/A'}
Phone: ${delivery.customer_phone || 'N/A'}
Address: ${delivery.delivery_address || 'N/A'}

Delivery Partner: ${delivery.delivery_partner_name || 'Not assigned'}
Partner Phone: ${delivery.delivery_partner_phone || 'N/A'}

Status: ${delivery.delivery_status?.toUpperCase() || 'PENDING'}
Created: ${new Date(delivery.created_at).toLocaleDateString()}
Items: ${delivery.items_count}
Total Value: ₹${delivery.total_value}

Notes: N/A
    `.trim()
    
    // Create PDF using jsPDF-like approach with browser's print-to-PDF
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shipping Slip - ${delivery.delivery_number}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              line-height: 1.6;
              white-space: pre-wrap;
              margin: 0;
            }
            @media print {
              body { padding: 10px; margin: 0; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <pre>${slipContent}</pre>
          <script>
            window.onload = function() {
              // Auto-trigger print dialog
              setTimeout(function() {
                window.print();
                // After print dialog closes, close the window
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            }
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()
      
      showSuccess('Shipping slip PDF download initiated! Choose "Save as PDF" in the print dialog.')
    } else {
      showError('Failed to open print window. Please check your browser settings and allow popups.')
    }
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.delivery_partner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || delivery.delivery_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800'
      case 'in_transit':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'scheduled':
        return <Calendar className="w-4 h-4" />
      case 'picked_up':
        return <Package className="w-4 h-4" />
      case 'in_transit':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
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
      <OperationsPageHeader
        title="Delivery Management"
        description="Manage and track all deliveries"
        icon={<Package className="h-8 w-8 text-indigo-600" />}
        actions={
          <div className="flex items-center space-x-4">
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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Deliveries Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
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
                          <div className="font-medium text-gray-900">
                          {formatDeliveryNumber(delivery.delivery_number)}
                        </div>
                          <div className="text-sm text-gray-500">
                            {delivery.order_number || `Order: ${delivery.order_id?.slice(0, 8)}...`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {delivery.customer_name || 'Customer not set'}
                        </div>
                        <div className="text-gray-500">
                          {delivery.customer_phone || 'Phone not set'}
                        </div>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.delivery_status)}`}>
                        {getStatusIcon(delivery.delivery_status)}
                        <span className="ml-1">{delivery.delivery_status?.replace('_', ' ').toUpperCase() || 'PENDING'}</span>
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
                            console.log('Opening view modal for delivery:', delivery)
                            console.log('Delivery address in modal:', delivery.delivery_address)
                            setSelectedDelivery(delivery)
                            setShowViewModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Delivery Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedDelivery(delivery)
                            setShowAssignModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Assign Delivery Partner"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedDelivery(delivery)
                            setShowStatusModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Update Delivery Status"
                        >
                          <Truck className="w-4 h-4" />
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

      {/* View Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Delivery Details</h2>
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
                    <p className="mt-1 text-sm text-gray-900 font-medium">{formatDeliveryNumber(selectedDelivery.delivery_number)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Number</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {selectedDelivery.order_number || `Order ID: ${selectedDelivery.order_id}`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedDelivery.delivery_status)}`}>
                      {getStatusIcon(selectedDelivery.delivery_status)}
                      <span className="ml-1">{selectedDelivery.delivery_status?.replace('_', ' ').toUpperCase() || 'PENDING'}</span>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDelivery.customer_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDelivery.customer_email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDelivery.customer_phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDelivery.delivery_address || 'Not set'}</p>
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
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Partner Modal */}
      {showAssignModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Delivery Partner</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Partner</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                >
                  <option value="">Select a partner...</option>
                  <option value="9f88457d-2762-462a-8b6f-c58e6b223d0b">Express Logistics - +91-98765-54323</option>
                  <option value="0ab7f8ca-7a44-4113-bbf1-61d3f08007af">Quick Delivery - +91-98765-54321</option>
                  <option value="0a6890b4-f835-4687-aa92-ff53809fc11c">Ram - 9876543210</option>
                  <option value="6b521c1a-984c-4ffb-b41f-0162fe77d205">Safe Transport - +91-98765-54322</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedPartnerId('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Assigning partner:', selectedPartnerId, 'to delivery:', selectedDelivery?.id)
                  if (selectedPartnerId && selectedDelivery) {
                    handleAssignPartner(selectedPartnerId)
                  } else {
                    console.log('Missing partnerId or delivery:', { selectedPartnerId, selectedDelivery })
                  }
                }}
                disabled={!selectedPartnerId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Delivery Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Select status...</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStatus('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Updating status:', selectedStatus, 'for delivery:', selectedDelivery?.id)
                  if (selectedStatus && selectedDelivery) {
                    handleUpdateStatus(selectedStatus)
                  } else {
                    console.log('Missing status or delivery:', { selectedStatus, selectedDelivery })
                  }
                }}
                disabled={!selectedStatus}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
