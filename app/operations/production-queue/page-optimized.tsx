'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import dynamic from 'next/dynamic'
import { Package } from 'lucide-react'
import OperationsPageHeader from '@/components/operations/OperationsPageHeader'

// Dynamically import components for better code splitting
const ProductionQueueHeader = dynamic(() => import('@/components/operations/ProductionQueueHeader'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-16 rounded-lg mb-6"></div>
  )
})

const OrderCard = dynamic(() => import('@/components/operations/OrderCard'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-32 rounded-lg mb-4"></div>
  )
})

const CumulativeRequirements = dynamic(() => import('@/components/operations/CumulativeRequirements'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
  )
})

const ProductGroupIngredients = dynamic(() => import('@/components/operations/ProductGroupIngredients'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
  )
})

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'in_production':
      return 'bg-purple-100 text-purple-800'
    case 'ready':
      return 'bg-green-100 text-green-800'
    case 'delivered':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Types (simplified for this example)
interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  delivery_notes: string
  customer_info?: any
  order_items: any[]
}

interface OrderWithIngredients extends Order {
  can_produce: boolean
  insufficient_count: number
  total_weight?: number
  customer_name?: string
}

export default function ProductionQueueOptimized() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<OrderWithIngredients[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [showProductGroupView, setShowProductGroupView] = useState(true)
  const [showCumulativeView, setShowCumulativeView] = useState(false)
  const [cumulativeRequirements, setCumulativeRequirements] = useState<any[]>([])
  const [createdPOs, setCreatedPOs] = useState<Set<string>>(new Set())

  // Calculate total weight for a product group
  const calculateProductGroupWeight = (productName: string, productItems: any[]) => {
    return productItems
      .filter(item => item.product_name === productName)
      .reduce((sum, item) => sum + (item.quantity * (item.weight_grams || item.variant_weight || 0)), 0)
  }

  // Group orders by product for product group view
  const groupOrdersByProduct = (orders: OrderWithIngredients[]) => {
    const productGroups: { [key: string]: OrderWithIngredients[] } = {}
    
    console.log('🔍 Starting product grouping for', orders.length, 'orders')
    
    // First, collect all unique products across all orders
    const allProductItems: any[] = []
    
    orders.forEach(order => {
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: any) => {
          allProductItems.push({
            ...item,
            order: order,
            // Extract product name from the nested structure
            product_name: item.product_variants?.products?.name || 'Unknown Product',
            variant_weight: item.product_variants?.weight_grams,
            weight_grams: item.product_variants?.weight_grams
          })
        })
      }
    })
    
    console.log('📦 Total product items found:', allProductItems.length)
    
    // Group by product name (since product_id is undefined)
    allProductItems.forEach((item: any) => {
      const productKey = item.product_name
      
      console.log('📦 Processing product item:', {
        orderNumber: item.order.order_number,
        product_name: item.product_name,
        variant_weight: item.variant_weight,
        weight_grams: item.weight_grams,
        productKey: productKey
      })
      
      if (!productGroups[productKey]) {
        productGroups[productKey] = []
      }
      
      // Add the order to this product group if not already added
      if (!productGroups[productKey].find(o => o.id === item.order.id)) {
        productGroups[productKey].push(item.order)
      }
    })
    
    console.log('📊 Final product groups:', Object.keys(productGroups).map(key => ({
      key,
      displayName: key,
      count: productGroups[key].length
    })))
    
    return { productGroups, allProductItems }
  }

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string, index?: number) => {
    const key = orderId || `index-${index}` // Use index as fallback for undefined IDs
    
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedOrders(newExpanded)
  }

  // Fetch production queue data
  const fetchProductionQueue = async () => {
    try {
      setLoading(true)
      
      // Check if user has operations role
      const profile = await getOperationsUserClient()
      if (!profile) {
        throw new Error('Access denied: User does not have operations permissions')
      }
      
      // Fetch orders with ingredient requirements using regular supabase client
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product_variants(
              *,
              products(name)
            )
          )
        `)
        .in('status', ['pending', 'confirmed', 'processing'])
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch customer profiles separately since the relationship isn't set up
      const customerIds = [...new Set(ordersData.map(order => order.customer_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', customerIds)

      // Create a map of customer profiles
      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {} as Record<string, any>)

      // Transform data and add ingredient requirements
      const transformedOrders = ordersData.map(order => ({
        ...order,
        customer: profileMap[order.customer_id] || null,
        customer_name: profileMap[order.customer_id]?.full_name || 'Unknown Customer',
        can_produce: true, // Mock data - would be calculated based on ingredients
        insufficient_count: 0, // Mock data - would be calculated based on ingredients
        total_weight: order.order_items?.reduce((sum: number, item: any) => 
          sum + (item.quantity * (item.product_variants?.weight_grams || 0)), 0) || 0
      }))

      setOrders(transformedOrders)
      
      // Calculate cumulative requirements
      const cumulative = calculateCumulativeRequirements(transformedOrders)
      setCumulativeRequirements(cumulative)
      
    } catch (error) {
      console.error('Error fetching production queue:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch production queue'
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate cumulative ingredient requirements
  const calculateCumulativeRequirements = (orders: OrderWithIngredients[]) => {
    // Mock implementation - would calculate actual cumulative requirements
    return []
  }

  // Start batch production
  const startBatchProduction = async (productName: string, orders: OrderWithIngredients[]) => {
    try {
      setUpdatingOrder('batch')
      
      // Mock implementation - would actually start production
      console.log('Starting batch production for:', productName, 'with orders:', orders)
      
      showToast({
        type: 'success',
        title: 'Success',
        message: `Batch production started for ${productName}`
      })
      
      // Refresh data
      await fetchProductionQueue()
      
    } catch (error) {
      console.error('Error starting batch production:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to start batch production'
      })
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Create purchase order for ingredient
  const createPurchaseOrder = async (ingredientId: string, ingredientName: string, supplierName: string, suggestedQuantity: number, displayUnit?: string) => {
    try {
      // Check if PO already exists for this ingredient
      const { data: supplier } = await supabase
        .from('vendors')
        .select('id')
        .eq('name', supplierName)
        .single()

      if (!supplier) {
        showToast({ type: 'error', title: 'Error', message: `Could not find supplier: ${supplierName}` })
        return
      }

      const { data: existingPOs } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          purchase_order_items!inner(ingredient_id)
        `)
        .eq('vendor_id', supplier.id)
        .eq('purchase_order_items.ingredient_id', ingredientId)
        .in('status', ['draft', 'sent', 'confirmed'])

      if (existingPOs && existingPOs.length > 0) {
        showToast({ type: 'warning', title: 'PO Already Exists', message: `PO for ${ingredientName} already exists` })
        setCreatedPOs(prev => new Set([...prev, ingredientId]))
        return
      }

      // Get ingredient unit cost and unit info
      const { data: ingredient } = await supabase
        .from('ingredients')
        .select('unit_cost, unit, name')
        .eq('id', ingredientId)
        .single()

      if (!ingredient) {
        showToast({ type: 'error', title: 'Error', message: `Could not fetch cost for ${ingredientName}` })
        return
      }

      // Use the suggested quantity directly (already converted by frontend)
      // No conversion needed since frontend sends correct display quantities
      let orderQuantity = suggestedQuantity
      let unitPrice = ingredient.unit_cost || 0
      let totalAmount = orderQuantity * unitPrice

      const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          order_number: orderNumber,
          vendor_id: supplier.id,
          status: 'draft',
          total_amount: totalAmount,
          notes: `Auto-generated PO for ${ingredientName} - Quantity: ${orderQuantity.toFixed(2)} ${displayUnit || ingredient.unit}`,
          created_by: user?.id
        })
        .select()
        .single()

      if (poError) {
        showToast({ type: 'error', title: 'Error', message: `Failed to create PO: ${poError.message}` })
        return
      }

      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .insert({
          purchase_order_id: poData.id,
          ingredient_id: ingredientId,
          quantity: orderQuantity,
          unit_price: unitPrice
        })

      if (itemError) {
        showToast({ type: 'error', title: 'Error', message: `Failed to add ingredient: ${itemError.message}` })
        return
      }

      await supabase
        .from('vendors')
        .update({ last_ordered: new Date().toISOString() })
        .eq('id', supplier.id)

      setCreatedPOs(prev => new Set([...prev, ingredientId]))
      
      showToast({
        type: 'success',
        title: 'Success',
        message: `PO created for ${ingredientName} - ${orderQuantity.toFixed(2)} ${displayUnit || ingredient.unit} (${totalAmount.toFixed(2)})`
      })

    } catch (error) {
      console.error('Error creating PO:', error)
      showToast({ type: 'error', title: 'Error', message: 'Failed to create purchase order' })
    }
  }

  // Check for cancelled POs and remove them from createdPOs set
  const checkForCancelledPOs = async () => {
    if (createdPOs.size === 0) return

    try {
      const { data: pos, error } = await supabase
        .from('purchase_orders')
        .select('id, notes')
        .in('id', Array.from(createdPOs))
        .eq('status', 'cancelled')

      if (error) {
        console.error('Error checking cancelled POs:', error)
        return
      }

      if (pos && pos.length > 0) {
        // Extract ingredient IDs from cancelled POs notes
        const cancelledIngredientIds = new Set<string>()
        pos.forEach(po => {
          // Extract ingredient name from notes to find the ingredient
          const match = po.notes.match(/Auto-generated PO for (.+?) -/)
          if (match) {
            const ingredientName = match[1]
            // Find ingredient ID by name (this is a simplified approach)
            cancelledIngredientIds.add(ingredientName)
          }
        })

        // Remove cancelled POs from the set
        setCreatedPOs(prev => {
          const newSet = new Set(prev)
          cancelledIngredientIds.forEach(id => newSet.delete(id))
          return newSet
        })

        showToast({
          type: 'info',
          title: 'PO Status Updated',
          message: `${pos.length} purchase order(s) were cancelled. PO buttons re-enabled.`
        })
      }
    } catch (error) {
      console.error('Error checking cancelled POs:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (user) {
      fetchProductionQueue()
      checkForCancelledPOs()
    }
  }, [user])

  // Periodically check for cancelled POs
  useEffect(() => {
    const interval = setInterval(() => {
      checkForCancelledPOs()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [createdPOs])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading production queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OperationsPageHeader
        title="Production Queue"
        description={showCumulativeView 
          ? 'Cumulative ingredient requirements view'
          : showProductGroupView
          ? 'Product group view'
          : 'Individual orders view'
        }
        icon={<Package className="h-8 w-8 text-blue-600" />}
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchProductionQueue()
                checkForCancelledPOs()
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              🔄 Refresh
            </button>
            
            <button
              onClick={() => setShowProductGroupView(!showProductGroupView)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showProductGroupView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="h-4 w-4 mr-1 inline">👁️</span>
              Product Groups
            </button>
            
            <button
              onClick={() => setShowCumulativeView(!showCumulativeView)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showCumulativeView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="h-4 w-4 mr-1 inline">👁️</span>
              Cumulative View
            </button>
            
            <button
              onClick={fetchProductionQueue}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}>🔄</span>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCumulativeView ? (
          /* Cumulative Requirements View */
          <CumulativeRequirements
            requirements={cumulativeRequirements}
            onCreatePurchaseOrder={createPurchaseOrder}
            createdPOs={createdPOs}
          />
        ) : showProductGroupView ? (
          /* Product Groups View */
          <div className="space-y-6">
            {Object.entries(groupOrdersByProduct(orders).productGroups).map(([productKey, productOrders]) => {
              // Use productKey directly as display name since we're grouping by product_name
              const displayName = productKey
              const orderKey = `${productKey}-${productOrders.length}`
              const { allProductItems } = groupOrdersByProduct(orders)
              
              const canProduceAll = productOrders.every(order => order.can_produce)
              const totalInsufficient = productOrders.reduce((sum: number, order: any) => sum + (order.insufficient_count || 0), 0)
              
              return (
                <div key={orderKey} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
                      <p className="text-sm text-gray-500">{productOrders.length} orders</p>
                    </div>
                    <button
                      onClick={() => startBatchProduction(displayName, productOrders)}
                      disabled={!canProduceAll || updatingOrder === 'batch'}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updatingOrder === 'batch' ? 'Creating Batch...' : 'Start Batch Production'}
                    </button>
                  </div>
                  
                  {/* Compact Order Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Orders in this batch ({productOrders.length})</span>
                      <span className="text-xs text-gray-500">
                        Total: {calculateProductGroupWeight(displayName, allProductItems).toFixed(0)}g
                      </span>
                    </div>
                    <div className="space-y-1">
                      {productOrders.slice(0, 3).map((order: any, index: number) => (
                        <div key={order.id || index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{order.order_number}</span>
                          <span className="text-gray-500">
                            {order.customer_name || 'Customer'} • {calculateProductGroupWeight(displayName, allProductItems.filter((item: any) => item.order.id === order.id)).toFixed(0)}g
                          </span>
                        </div>
                      ))}
                      {productOrders.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{productOrders.length - 3} more orders
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ingredient Requirements */}
                  <div className="mt-4">
                    <ProductGroupIngredients 
                      productName={displayName} 
                      orders={productOrders}
                      onCreatePurchaseOrder={createPurchaseOrder}
                      createdPOs={createdPOs}
                    />
                  </div>

                  {/* Individual Orders Toggle */}
                  <div className="mt-4">
                    <button
                      onClick={() => toggleOrderExpansion(orderKey)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {expandedOrders.has(orderKey) ? 'Hide' : 'Show'} Individual Orders
                      <svg 
                        className={`ml-1 h-4 w-4 transform transition-transform ${expandedOrders.has(orderKey) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Individual Orders List */}
                  {expandedOrders.has(orderKey) && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {productOrders.map((order: any, index: number) => (
                        <div key={order.id || index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{order.order_number}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleOrderExpansion(order.id || `index-${index}`)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                {expandedOrders.has(order.id || `index-${index}`) ? 'Hide' : 'Show'} Ingredients
                              </button>
                              <button
                                onClick={() => startBatchProduction(displayName, [order])}
                                disabled={!order.can_produce || updatingOrder === order.id}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {updatingOrder === order.id ? 'Processing...' : 'Produce'}
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Customer: {order.customer_name || 'N/A'} • 
                            Weight: {calculateProductGroupWeight(displayName, allProductItems.filter((item: any) => item.order.id === order.id)).toFixed(0)}g
                            {order.total_amount && ` • Amount: $${order.total_amount}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* Individual Orders View */
          <div className="space-y-4">
            {orders.map((order, index) => (
              <OrderCard
                key={order.id || index}
                order={{
                  ...order,
                  ingredient_requirements: [],
                  priority_order: 0,
                  total_weight: order.total_weight || 0
                }}
                isExpanded={expandedOrders.has(order.id || `index-${index}`)}
                onToggleExpand={() => toggleOrderExpansion(order.id || `index-${index}`)}
                onStartProduction={(orderId: string) => startBatchProduction('', [order])}
                updatingOrder={updatingOrder}
                createdPOs={createdPOs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
