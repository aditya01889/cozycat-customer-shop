'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import dynamic from 'next/dynamic'

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
  ingredient_requirements: any[]
  can_produce: boolean
  insufficient_count: number
  total_weight: number
  priority_order: number
  customer_name?: string
  customer_email?: string
  ingredient_count?: number
}

interface CumulativeRequirements {
  ingredient_id: string
  ingredient_name: string
  total_required: number
  current_stock: number
  shortage: number
  affected_orders: string[]
  supplier_name?: string
  supplier_phone?: string
  supplier_email?: string
}

export default function ProductionQueueOptimized() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  
  // State management
  const [orders, setOrders] = useState<OrderWithIngredients[]>([])
  const [cumulativeRequirements, setCumulativeRequirements] = useState<CumulativeRequirements[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCumulativeView, setShowCumulativeView] = useState(false)
  const [showProductGroupView, setShowProductGroupView] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [createdPOs, setCreatedPOs] = useState<Set<string>>(new Set())
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [operationsUser, setOperationsUser] = useState<any>(null)

  // Check if user is operations user
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'admin' || profile?.role === 'operations') {
          setOperationsUser(true)
        }
      }
    }
    checkUserRole()
  }, [])

  // Fetch production queue data
  const fetchProductionQueue = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .rpc('get_production_queue_with_ingredients')

      if (error) {
        console.error('Error fetching production queue:', error)
        setError('Failed to load production queue')
        return
      }

      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching production queue:', err)
      setError('Failed to load production queue')
    } finally {
      setLoading(false)
    }
  }

  // Fetch cumulative requirements
  const fetchCumulativeRequirements = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_cumulative_ingredient_requirements')

      if (error) {
        console.error('Error fetching cumulative requirements:', error)
        return
      }

      setCumulativeRequirements(data || [])
    } catch (err) {
      console.error('Error fetching cumulative requirements:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (operationsUser) {
      fetchProductionQueue()
      fetchCumulativeRequirements()
    }
  }, [operationsUser])

  // Start production for an order
  const startProduction = async (orderId: string) => {
    if (!operationsUser || !orderId) return

    setUpdatingOrder(orderId)
    try {
      const { error } = await supabase
        .rpc('start_order_production', { order_id: orderId })

      if (error) {
        console.error('Error starting production:', error)
        setError('Failed to start production')
        return
      }

      // Refresh the queue
      await fetchProductionQueue()
    } catch (err) {
      console.error('Error starting production:', err)
      setError('Failed to start production')
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Start batch production for a product group
  const startBatchProduction = async (productName: string, productOrders: OrderWithIngredients[]) => {
    if (!operationsUser) return

    const orderIds = productOrders.map(order => order.id).filter(Boolean)
    if (orderIds.length === 0) return

    setUpdatingOrder('batch')
    try {
      // Create a batch for all orders of this product
      const { error } = await supabase
        .rpc('create_production_batch', { 
          order_ids: orderIds,
          batch_name: `${productName} - Batch ${new Date().toISOString().split('T')[0]}`
        })

      if (error) {
        console.error('Error creating batch:', error)
        setError('Failed to create production batch')
        return
      }

      // Refresh the queue
      await fetchProductionQueue()
    } catch (err) {
      console.error('Error creating batch:', err)
      setError('Failed to create production batch')
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Create purchase order
  const createPurchaseOrder = async (
    ingredientId: string,
    ingredientName: string,
    supplierName: string,
    suggestedQuantity: number
  ) => {
    try {
      // This would create a purchase order in the system
      console.log('Creating PO for:', { ingredientId, ingredientName, supplierName, suggestedQuantity })
      
      // Add to created POs set to track
      setCreatedPOs(prev => new Set([...prev, ingredientId]))
    } catch (err) {
      console.error('Error creating purchase order:', err)
    }
  }

  // Group orders by product for product group view
  const groupOrdersByProduct = (orders: OrderWithIngredients[]) => {
    const productGroups: { [key: string]: OrderWithIngredients[] } = {}
    
    orders.forEach(order => {
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: any) => {
          const productKey = item.product_name || 'Unknown Product'
          if (!productGroups[productKey]) {
            productGroups[productKey] = []
          }
          productGroups[productKey].push(order)
        })
      }
    })
    
    return productGroups
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
      <ProductionQueueHeader
        loading={loading}
        showCumulativeView={showCumulativeView}
        showProductGroupView={showProductGroupView}
        onRefresh={fetchProductionQueue}
        onToggleCumulativeView={() => setShowCumulativeView(!showCumulativeView)}
        onToggleProductGroupView={() => setShowProductGroupView(!showProductGroupView)}
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
            {Object.entries(groupOrdersByProduct(orders)).map(([productName, productOrders]) => {
              const orderKey = `${productName}-${productOrders.length}`
              const canProduceAll = productOrders.every(order => order.can_produce)
              const totalInsufficient = productOrders.reduce((sum, order) => sum + (order.insufficient_count || 0), 0)
              
              return (
              <div key={orderKey} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
                    <div className="text-sm text-gray-600">
                      {productOrders.length} order{productOrders.length > 1 ? 's' : ''} • 
                      Total weight: {productOrders.reduce((sum, order) => sum + (order.total_weight || 0), 0).toFixed(0)}g
                      {totalInsufficient > 0 && (
                        <span className="text-red-600 ml-2">
                          {totalInsufficient} insufficient ingredients
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startBatchProduction(productName, productOrders)}
                    disabled={!canProduceAll || updatingOrder === 'batch'}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {updatingOrder === 'batch' ? 'Creating Batch...' : 'Start Batch Production'}
                  </button>
                </div>
                <div className="space-y-2">
                  {productOrders
                    .sort((a, b) => a.priority_order - b.priority_order)
                    .map((order, index) => (
                      <div key={order.id || `order-${index}`} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{order.order_number}</div>
                            <div className="text-sm text-gray-600">{order.customer_name}</div>
                            <div className="text-xs text-gray-500">
                              {order.total_weight?.toFixed(0)}g • {order.ingredient_count} ingredients
                              {order.insufficient_count > 0 && (
                                <span className="text-red-600 ml-2">
                                  {order.insufficient_count} insufficient
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Priority: {order.priority_order}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              )
            })}
          </div>
        ) : (
          /* Individual Orders View */
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders in production queue</h3>
                <p className="text-gray-500">All orders are either completed or don't require production</p>
              </div>
            ) : (
              orders
                .sort((a, b) => a.priority_order - b.priority_order)
                .map((order, index) => {
                  const orderKey = order.id || `index-${index}`
                  return (
                  <OrderCard
                    key={order.id ? `order-${order.id}` : `order-${index}`}
                    order={order}
                    isExpanded={expandedOrders.has(orderKey)}
                    onToggleExpand={() => toggleOrderExpansion(order.id, index)}
                    onStartProduction={startProduction}
                    updatingOrder={updatingOrder}
                    createdPOs={createdPOs}
                  />
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
