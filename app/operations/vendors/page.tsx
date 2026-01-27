'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import Link from 'next/link'
import { 
  Users2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Package,
  Clock,
  X,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  is_active: boolean
  payment_terms: string | null
  created_at: string
  last_ordered: string | null
}

interface PurchaseOrder {
  id: string
  order_number: string
  status: string
  total_amount: number
  notes: string
  created_at: string
  sent_at: string | null
  confirmed_at: string | null
  received_at: string | null
}

interface Ingredient {
  id: string
  name: string
  unit: string
  current_stock: number
  unit_cost: number
}

function VendorPurchaseOrders({ vendorId, showSuccess, showError, showWarning, showInfo }: { 
  vendorId: string
  showSuccess: (message: string, title?: string) => string
  showError: (error: Error | any, config?: any) => string
  showWarning: (message: string, title?: string) => string
  showInfo: (message: string, title?: string) => string
}) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchPurchaseOrders()
  }, [vendorId])

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_vendor_purchase_orders', { p_vendor_id: vendorId })

      if (error) throw error
      setPurchaseOrders(data || [])
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'received': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const updatePurchaseOrderStatus = async (poId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus
      }

      // Add timestamps for specific status changes
      if (newStatus === 'sent') {
        updateData.sent_at = new Date().toISOString()
      } else if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (newStatus === 'received') {
        updateData.received_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', poId)

      if (error) throw error

      // If marked as received, add inventory
      if (newStatus === 'received') {
        const { data: inventoryResult, error: inventoryError } = await supabase
          .rpc('add_inventory_from_po', { p_po_id: poId })
        
        if (inventoryError) {
          console.error('Error adding inventory:', inventoryError)
        } else {
          const result = inventoryResult?.[0]
          if (result?.success) {
            showInfo(`Purchase order marked as received!\n${result.message}`, 'PO Received')
          } else {
            showWarning(`Purchase order marked as received, but inventory update failed: ${result?.message}`, 'Partial Success')
          }
        }
      }

      // Refresh the purchase orders
      fetchPurchaseOrders()
    } catch (error) {
      console.error('Error updating PO status:', error)
      showError(error instanceof Error ? error : new Error('Failed to update purchase order status'))
    }
  }

  const cancelPurchaseOrder = async (poId: string) => {
    if (!confirm('Are you sure you want to cancel this purchase order?')) {
      return
    }

    try {
      const { data, error } = await supabase
        .rpc('cancel_purchase_order', { p_po_id: poId })

      if (error) throw error

      // Refresh the purchase orders
      fetchPurchaseOrders()
      
      const result = data?.[0]
      if (result?.success) {
        showSuccess(result.message, 'PO Cancelled')
      } else {
        showWarning(result?.message || 'Failed to cancel purchase order', 'Cancellation Failed')
      }
    } catch (error) {
      console.error('Error cancelling PO:', error)
      showError(error instanceof Error ? error : new Error('Failed to cancel purchase order'))
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-4 border-t">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Purchase Orders ({purchaseOrders.length})</h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {expanded && purchaseOrders.length > 0 && (
        <div className="space-y-2">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{po.order_number}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-600 mb-2">
                <div>Amount: ₹{po.total_amount.toFixed(2)}</div>
                <div>Created: {formatDate(po.created_at)}</div>
                {po.sent_at && <div>Sent: {formatDate(po.sent_at)}</div>}
                {po.confirmed_at && <div>Confirmed: {formatDate(po.confirmed_at)}</div>}
                {po.received_at && <div>Received: {formatDate(po.received_at)}</div>}
              </div>
              {po.notes && (
                <div className="mt-2 text-gray-500 text-xs italic mb-2">
                  {po.notes}
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-2">
                {po.status === 'draft' && (
                  <>
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'sent')}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Send to Vendor
                    </button>
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'confirmed')}
                      className="px-2 py-1 bg-green-500 text-white text-white text-xs rounded hover:bg-green-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => cancelPurchaseOrder(po.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {po.status === 'sent' && (
                  <>
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'confirmed')}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => cancelPurchaseOrder(po.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {po.status === 'confirmed' && (
                  <button
                    onClick={() => updatePurchaseOrderStatus(po.id, 'received')}
                    className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                  >
                    Mark Received
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {expanded && purchaseOrders.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          No purchase orders found for this vendor
        </div>
      )}
    </div>
  )
}

export default function VendorManagement() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [operationsUser, setOperationsUser] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCustomPOModal, setShowCustomPOModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    payment_terms: ''
  })
  const [customPOData, setCustomPOData] = useState({
    vendor_id: '',
    ingredient_id: '',
    quantity: '',
    unit_cost: '',
    notes: ''
  })

  useEffect(() => {
    checkOperationsAccess()
    fetchVendors()
  }, [])

  const checkOperationsAccess = async () => {
    const opsUser = await getOperationsUserClient()
    if (!opsUser) {
      window.location.href = '/'
      return
    }
    setOperationsUser(opsUser)
  }

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name')

      if (error) throw error
      
      console.log('Fetched vendors data structure:', data?.[0])
      setVendors(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVendorStatus = async (vendorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: !currentStatus })
        .eq('id', vendorId)

      if (error) throw error
      
      // Refresh vendors list
      await fetchVendors()
    } catch (error) {
      console.error('Error updating vendor status:', error)
      showError(error instanceof Error ? error : new Error('Failed to update vendor status'))
    }
  }

  const handleAddVendor = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showWarning('Vendor name is required', 'Validation Error')
        return
      }

      // Filter out empty strings for optional fields - only include fields that exist in database
      const vendorData = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        payment_terms: formData.payment_terms.trim() || null,
        is_active: true
      }

      console.log('Inserting vendor data:', vendorData)
      
      // Validate the data object before sending
      if (!vendorData.name) {
        throw new Error('Vendor name is required')
      }

      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()

      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2))
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        throw new Error(error.message || 'Unknown database error')
      }
      
      console.log('Vendor added successfully:', data)
      setShowAddModal(false)
      resetForm()
      await fetchVendors()
    } catch (error) {
      console.error('Error adding vendor:', error)
      showError(error instanceof Error ? error : new Error('Failed to add vendor'))
    }
  }

  const handleEditVendor = async () => {
    if (!selectedVendor) return

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showWarning('Vendor name is required', 'Validation Error')
        return
      }

      // Filter out empty strings for optional fields - only include fields that exist in database
      const vendorData = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        payment_terms: formData.payment_terms.trim() || null
      }

      console.log('Updating vendor data:', vendorData)

      const { data, error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('id', selectedVendor.id)
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      
      console.log('Vendor updated successfully:', data)
      setShowEditModal(false)
      resetForm()
      setSelectedVendor(null)
      await fetchVendors()
    } catch (error) {
      console.error('Error updating vendor:', error)
      showError(error instanceof Error ? error : new Error('Failed to update vendor'))
    }
  }

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return

    try {
      console.log('Deleting vendor:', selectedVendor.id, selectedVendor.name)
      
      const { data, error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', selectedVendor.id)
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      
      console.log('Vendor deleted successfully:', data)
      setShowDeleteModal(false)
      setSelectedVendor(null)
      await fetchVendors()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      showError(error instanceof Error ? error : new Error('Failed to delete vendor'))
    }
  }

  const openEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      payment_terms: vendor.payment_terms || ''
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      payment_terms: ''
    })
  }

  const fetchIngredients = async () => {
    try {
      setLoadingIngredients(true)
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, unit, current_stock, unit_cost')
        .order('name')

      if (error) throw error
      setIngredients(data || [])
    } catch (error) {
      console.error('Error fetching ingredients:', error)
      showError(error instanceof Error ? error : new Error('Failed to fetch ingredients'))
    } finally {
      setLoadingIngredients(false)
    }
  }

  const openCustomPOModal = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setCustomPOData({
      vendor_id: vendor.id,
      ingredient_id: '',
      quantity: '',
      unit_cost: '',
      notes: ''
    })
    fetchIngredients()
    setShowCustomPOModal(true)
  }

  const handleCreateCustomPO = async () => {
    try {
      // Validate required fields
      if (!customPOData.vendor_id || !customPOData.ingredient_id || !customPOData.quantity || !customPOData.unit_cost) {
        showWarning('Please fill in all required fields', 'Validation Error')
        return
      }

      const quantity = parseFloat(customPOData.quantity)
      const unitCost = parseFloat(customPOData.unit_cost)

      if (isNaN(quantity) || quantity <= 0) {
        showWarning('Please enter a valid quantity', 'Validation Error')
        return
      }

      if (isNaN(unitCost) || unitCost <= 0) {
        showWarning('Please enter a valid unit cost', 'Validation Error')
        return
      }

      // Generate PO number
      const poNumber = `PO-${Date.now()}`

      // Get ingredient details
      const ingredient = ingredients.find(i => i.id === customPOData.ingredient_id)
      if (!ingredient) {
        showWarning('Selected ingredient not found', 'Error')
        return
      }

      // Create PO
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          order_number: poNumber,
          vendor_id: customPOData.vendor_id,
          status: 'draft',
          total_amount: quantity * unitCost,
          notes: customPOData.notes || `Custom PO for ${quantity} ${ingredient.unit} of ${ingredient.name} at ₹${unitCost}/${ingredient.unit}`
        })
        .select()
        .single()

      if (poError) throw poError

      // Create PO item
      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .insert({
          purchase_order_id: poData.id,
          ingredient_id: customPOData.ingredient_id,
          quantity: quantity,
          unit_price: unitCost,
          status: 'ordered'
        })

      if (itemError) throw itemError

      showSuccess(`Custom PO ${poNumber} created successfully!`, 'PO Created')
      setShowCustomPOModal(false)
      setCustomPOData({
        vendor_id: '',
        ingredient_id: '',
        quantity: '',
        unit_cost: '',
        notes: ''
      })
      
      // Refresh vendor purchase orders
      window.location.reload()
    } catch (error) {
      console.error('Error creating custom PO:', error)
      showError(error instanceof Error ? error : new Error('Failed to create custom PO'))
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = showInactive || vendor.is_active
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading vendors...</p>
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
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                Back to Dashboard
              </Link>
              <span className="text-2xl mr-3">👥</span>
              <h1 className="text-xl font-bold text-gray-900">Vendor Management</h1>
            </div>
            <div className="text-sm text-gray-600">
              {vendors.filter(v => v.is_active).length} active vendors
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => !v.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users2 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => {
                    if (!v.last_ordered) return false
                    const daysDiff = (new Date().getTime() - new Date(v.last_ordered).getTime()) / (1000 * 60 * 60 * 24)
                    return daysDiff <= 30
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <label className="flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="mr-2"
                />
                Show Inactive
              </label>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Vendor
            </button>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
              <Users2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600">Try adjusting your search or add a new vendor.</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Vendor Header */}
                <div className={`p-6 border-b ${vendor.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {vendor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {vendor.contact_person && (
                    <p className="text-sm text-gray-600 mb-2">Contact: {vendor.contact_person}</p>
                  )}
                </div>

                {/* Vendor Details */}
                <div className="p-6 space-y-3">
                  {vendor.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{vendor.phone}</span>
                    </div>
                  )}
                  
                  {vendor.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{vendor.email}</span>
                    </div>
                  )}
                  
                  {vendor.address && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{vendor.address}</span>
                    </div>
                  )}

                  {vendor.payment_terms && (
                    <div className="text-sm">
                      <span className="text-gray-600">Payment Terms: </span>
                      <span className="text-gray-900">{vendor.payment_terms}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-gray-900">{vendor.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Order:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatDate(vendor.last_ordered)}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Orders */}
                <VendorPurchaseOrders 
                  vendorId={vendor.id} 
                  showSuccess={showSuccess}
                  showError={showError}
                  showWarning={showWarning}
                  showInfo={showInfo}
                />

                {/* Actions */}
                <div className="px-6 pb-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openCustomPOModal(vendor)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Create Custom PO"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(vendor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(vendor)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => toggleVendorStatus(vendor.id, vendor.is_active)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        vendor.is_active
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {vendor.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Vendor</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Net 30, 50% Advance"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
                          </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                disabled={!formData.name}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Vendor</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                    setSelectedVendor(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Net 30, 50% Advance"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
                          </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                  setSelectedVendor(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditVendor}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Vendor Modal */}
      {showDeleteModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Delete Vendor</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedVendor(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {selectedVendor.name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. All vendor data will be permanently deleted.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  <strong>Warning:</strong> If this vendor has existing orders, deleting them may cause data integrity issues.
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedVendor(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVendor}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom PO Modal */}
      {showCustomPOModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Custom Purchase Order</h2>
                  <p className="text-sm text-gray-600 mt-1">Vendor: {selectedVendor.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowCustomPOModal(false)
                    setCustomPOData({
                      vendor_id: '',
                      ingredient_id: '',
                      quantity: '',
                      unit_cost: '',
                      notes: ''
                    })
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient *</label>
                  <select
                    value={customPOData.ingredient_id}
                    onChange={(e) => setCustomPOData({...customPOData, ingredient_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loadingIngredients}
                  >
                    <option value="">Select an ingredient</option>
                    {ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit}) - Current Stock: {ingredient.current_stock}
                      </option>
                    ))}
                  </select>
                  {loadingIngredients && (
                    <p className="text-xs text-gray-500 mt-1">Loading ingredients...</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={customPOData.quantity}
                    onChange={(e) => setCustomPOData({...customPOData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    value={customPOData.unit_cost}
                    onChange={(e) => setCustomPOData({...customPOData, unit_cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter unit cost"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                    ₹{(parseFloat(customPOData.quantity || '0') * parseFloat(customPOData.unit_cost || '0')).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={customPOData.notes}
                  onChange={(e) => setCustomPOData({...customPOData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional notes for this purchase order"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Custom Purchase Order</p>
                    <p>This will create a custom purchase order that is not blocked by any existing POs. The order will be created in "draft" status and can be sent to the vendor when ready.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCustomPOModal(false)
                  setCustomPOData({
                    vendor_id: '',
                    ingredient_id: '',
                    quantity: '',
                    unit_cost: '',
                    notes: ''
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomPO}
                disabled={!customPOData.ingredient_id || !customPOData.quantity || !customPOData.unit_cost || loadingIngredients}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Custom PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
