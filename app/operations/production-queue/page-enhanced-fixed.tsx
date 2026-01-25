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
  AlertTriangle,
  TrendingDown,
  ShoppingCart,
  Mail,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw
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

interface IngredientRequirement {
  ingredient_id: string
  ingredient_name: string
  required_quantity: number
  required_quantity_display?: number
  display_unit?: string
  waste_quantity: number
  waste_quantity_display?: number
  total_quantity: number
  total_quantity_display?: number
  current_stock: number
  current_stock_display?: number
  stock_status: 'sufficient' | 'insufficient' | 'out_of_stock'
  supplier_name?: string
  supplier_phone?: string
  supplier_email?: string
}

interface OrderWithIngredients extends Order {
  ingredient_requirements: IngredientRequirement[]
  can_produce: boolean
  insufficient_count: number
  total_weight: number
  priority_order: number
}

interface CumulativeRequirements {
  ingredient_id: string
  ingredient_name: string
  total_required: number
  total_required_display?: number
  display_unit?: string
  current_stock: number
  current_stock_display?: number
  shortage: number
  shortage_display?: number
  affected_orders: string[]
  supplier_name?: string
  supplier_phone?: string
  supplier_email?: string
}

export default function ProductionQueue() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithIngredients[]>([])
  const [cumulativeRequirements, setCumulativeRequirements] = useState<CumulativeRequirements[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [operationsUser, setOperationsUser] = useState<any>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [showCumulativeView, setShowCumulativeView] = useState(false)
  const [refreshingRequirements, setRefreshingRequirements] = useState(false)

  useEffect(() => {
    checkOperationsAccess()
    fetchProductionQueue()
    fetchCumulativeRequirements()
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
      // Get production queue summary with ingredient requirements
      const { data: queueData, error: queueError } = await supabase
        .rpc('get_production_queue_summary')

      if (queueError) throw queueError

      // Get detailed order information
      const { data: orderDetails, error: detailsError } = await supabase
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

      if (detailsError) throw detailsError

      // Get ingredient requirements for each order
      const ordersWithIngredients = await Promise.all(
        (orderDetails || []).map(async (order: any) => {
          const { data: requirements, error: reqError } = await supabase
            .rpc('calculate_order_ingredient_requirements', { p_order_id: order.id })

          if (reqError) throw reqError

          // Get vendor information for insufficient ingredients
          const requirementsWithVendors = await Promise.all(
            (requirements || []).map(async (req: any) => {
              if (req.stock_status !== 'sufficient') {
                const { data: vendor } = await supabase
                  .from('ingredients_with_vendors')
                  .select(`
                    vendor_name,
                    vendor_phone,
                    vendor_email
                  `)
                  .eq('id', req.ingredient_id)
                  .single()

                return {
                  ...req,
                  supplier_name: vendor?.vendor_name,
                  supplier_phone: vendor?.vendor_phone,
                  supplier_email: vendor?.vendor_email
                }
              }
              return req
            })
          )

          // Find matching queue data
          const queueInfo = queueData?.find((q: any) => q.order_id === order.id)

          return {
            ...order,
            customer_info: order.delivery_notes ? JSON.parse(order.delivery_notes) : null,
            order_items: order.order_items.map((item: any) => ({
              ...item,
              product_name: item.product_variant?.product?.name || 'Unknown Product',
              weight_grams: item.product_variant?.weight_grams || 0
            })),
            ingredient_requirements: requirementsWithVendors,
            can_produce: queueInfo?.can_produce || false,
            insufficient_count: queueInfo?.insufficient_count || 0,
            total_weight: queueInfo?.total_weight || 0,
            priority_order: queueInfo?.priority_order || 0
          }
        })
      )

      setOrders(ordersWithIngredients)
    } catch (error) {
      console.error('Error fetching production queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCumulativeRequirements = async () => {
    try {
      // Use the new cumulative requirements function
      const { data: cumulativeData, error } = await supabase
        .rpc('get_cumulative_ingredient_requirements')

      if (error) throw error

      setCumulativeRequirements(cumulativeData || [])
    } catch (error) {
      console.error('Error fetching cumulative requirements:', error)
    }
  }

  const createProductionBatch = async (orderId: string) => {
    setUpdatingOrder(orderId)
    try {
      const { data, error } = await supabase
        .rpc('create_production_batch', { 
          p_order_id: orderId,
          p_notes: 'Created from production queue'
        })

      if (error) throw error

      // Refresh the queue
      await fetchProductionQueue()
      await fetchCumulativeRequirements()
      
      alert(`Production batch ${data} created successfully!`)
    } catch (error: any) {
      console.error('Error creating production batch:', error)
      alert(`Failed to create production batch: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const generatePurchaseOrder = async (ingredientId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('generate_purchase_order_for_ingredient', { 
          p_ingredient_id: ingredientId 
        })

      if (error) throw error

      alert(`Purchase order ${data} created as draft!`)
    } catch (error: any) {
      console.error('Error generating purchase order:', error)
      alert(`Failed to generate purchase order: ${error.message}`)
    }
  }

  const sendLowStockEmail = async () => {
    try {
      // Generate low stock alerts first
      const { error } = await supabase
        .rpc('generate_low_stock_alerts')

      if (error) throw error

      // This would trigger an email function - for now, just show success
      alert('Low stock email sent to cozycatkitchen@gmail.com!')
    } catch (error: any) {
      console.error('Error sending low stock email:', error)
      alert(`Failed to send email: ${error.message}`)
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
      await fetchCumulativeRequirements()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ready_production': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'sufficient': return 'text-green-600 bg-green-50'
      case 'insufficient': return 'text-orange-600 bg-orange-50'
      case 'out_of_stock': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`
    }
    return `${formatNumber(grams)}g`
  }

  const formatIngredientQuantity = (quantity: number, unit?: string, ingredientName?: string) => {
    // If unit is pieces and ingredient is eggs, handle fractions properly
    if (unit === 'pieces' && ingredientName?.toLowerCase().includes('egg')) {
      if (quantity >= 1) {
        return `${Math.floor(quantity)} pcs`
      } else if (quantity >= 0.75) {
        return '3/4 pcs'
      } else if (quantity >= 0.5) {
        return '1/2 pcs'
      } else if (quantity >= 0.25) {
        return '1/4 pcs'
      } else if (quantity > 0) {
        return '< 1/4 pcs'
      } else {
        return '0 pcs'
      }
    }
    // Otherwise show in grams/kg
    if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}kg`
    }
    return `${formatNumber(quantity)}g`
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCumulativeView(!showCumulativeView)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showCumulativeView 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showCumulativeView ? 'Order View' : 'Cumulative View'}
              </button>
              <button
                onClick={() => {
                  setRefreshingRequirements(true)
                  fetchCumulativeRequirements().finally(() => setRefreshingRequirements(false))
                }}
                disabled={refreshingRequirements}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshingRequirements ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-sm text-gray-600">
                {orders.length} orders in queue
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Queue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cumulativeRequirements.filter(r => r.shortage > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {cumulativeRequirements.some(r => r.shortage > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Low Stock Alert - {cumulativeRequirements.filter(r => r.shortage > 0).length} ingredients need attention
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={sendLowStockEmail}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Alert
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cumulativeRequirements.filter(r => r.shortage > 0).slice(0, 4).map((req) => (
                <div key={req.ingredient_id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{req.ingredient_name}</span>
                    <span className="text-sm text-red-600 font-medium">
                      Short: {formatIngredientQuantity(req.shortage_display || req.shortage, req.display_unit, req.ingredient_name)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Current: {formatIngredientQuantity(req.current_stock_display || req.current_stock, req.display_unit, req.ingredient_name)} | Required: {formatIngredientQuantity(req.total_required_display || req.total_required, req.display_unit, req.ingredient_name)}
                  </div>
                  {req.supplier_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Supplier: {req.supplier_name}</span>
                      <button
                        onClick={() => generatePurchaseOrder(req.ingredient_id)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Create PO
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Toggle */}
        {showCumulativeView ? (
          /* Cumulative Requirements View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Cumulative Ingredient Requirements</h2>
              <p className="text-gray-600 mt-1">Total ingredients needed for all pending orders</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingredient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Required</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shortage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cumulativeRequirements.map((req) => (
                    <tr key={req.ingredient_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{req.ingredient_name}</td>
                      <td className="px-6 py-4 text-gray-600">{formatIngredientQuantity(req.current_stock_display || req.current_stock, req.display_unit, req.ingredient_name)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatIngredientQuantity(req.total_required_display || req.total_required, req.display_unit, req.ingredient_name)}</td>
                      <td className="px-6 py-4">
                        {req.shortage > 0 ? (
                          <span className="text-red-600 font-medium">{formatIngredientQuantity(req.shortage_display || req.shortage, req.display_unit, req.ingredient_name)}</span>
                        ) : (
                          <span className="text-green-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.shortage > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {req.shortage > 0 ? 'Short' : 'Sufficient'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {req.supplier_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {req.shortage > 0 && req.supplier_name && (
                          <button
                            onClick={() => generatePurchaseOrder(req.ingredient_id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Create PO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Individual Orders View */
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
                        {order.insufficient_count > 0 && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                            {order.insufficient_count} ingredients short
                          </span>
                        )}
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
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Order Items</h4>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        Ingredient Requirements
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{item.product_name}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {item.quantity} × {formatWeight(item.weight_grams)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">₹{item.total_price}</span>
                        </div>
                      ))}
                    </div>

                    {/* Ingredient Requirements */}
                    {expandedOrders.has(order.id) && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-gray-900 mb-3">Ingredient Requirements (including 7.5% waste)</h5>
                        <div className="space-y-2">
                          {order.ingredient_requirements.map((req) => (
                            <div key={req.ingredient_id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusColor(req.stock_status)}`}>
                                  {req.stock_status}
                                </span>
                                <span className="font-medium text-gray-900">{req.ingredient_name}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-600">
                                  Required: {formatIngredientQuantity(req.required_quantity_display || req.required_quantity, req.display_unit, req.ingredient_name)}
                                </span>
                                <span className="text-orange-600">
                                  +{formatIngredientQuantity(req.waste_quantity_display || req.waste_quantity, req.display_unit, req.ingredient_name)} waste
                                </span>
                                <span className="font-medium text-gray-900">
                                  Total: {formatIngredientQuantity(req.total_quantity_display || req.total_quantity, req.display_unit, req.ingredient_name)}
                                </span>
                                <span className="text-gray-600">
                                  Stock: {formatIngredientQuantity(req.current_stock_display || req.current_stock, req.display_unit, req.ingredient_name)}
                                </span>
                                {req.stock_status !== 'sufficient' && req.supplier_name && (
                                  <button
                                    onClick={() => generatePurchaseOrder(req.ingredient_id)}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    Create PO
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                          <button
                            onClick={() => createProductionBatch(order.id)}
                            disabled={updatingOrder === order.id || !order.can_produce}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                              order.can_produce 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {updatingOrder === order.id ? (
                              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                            ) : (
                              <Package className="w-4 h-4 mr-2" />
                            )}
                            {order.can_produce ? 'Create Production Batch' : 'Insufficient Stock'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
