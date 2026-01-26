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
  const [showCumulativeView, setShowCumulativeView] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [createdPOs, setCreatedPOs] = useState<Set<string>>(new Set())
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [operationsUser, setOperationsUser] = useState<any>(null)

  // Initialize operations user
  useEffect(() => {
    const initOperationsUser = async () => {
      try {
        const opsUser = await getOperationsUserClient()
        setOperationsUser(opsUser)
      } catch (error) {
        console.error('Failed to initialize operations user:', error)
        showError('Failed to initialize operations access')
      }
    }
    initOperationsUser()
  }, [showError])

  // Fetch production queue data
  const fetchProductionQueue = async () => {
    if (!operationsUser) return

    setLoading(true)
    try {
      // Fetch pending orders with ingredient requirements
      const { data: ordersData, error: ordersError } = await supabase
        .rpc('get_production_queue_with_ingredients')

      if (ordersError) {
        console.error('Error fetching production queue:', ordersError)
        showError('Failed to fetch production queue')
        return
      }

      const processedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        ingredient_requirements: order.ingredient_requirements || [],
        can_produce: order.can_produce || false,
        insufficient_count: order.insufficient_count || 0,
        total_weight: order.total_weight || 0,
        priority_order: order.priority_order || 0
      }))

      setOrders(processedOrders)

      // Fetch cumulative requirements
      const { data: cumulativeData, error: cumulativeError } = await supabase
        .rpc('get_cumulative_ingredient_requirements')

      if (cumulativeError) {
        console.error('Error fetching cumulative requirements:', cumulativeError)
      } else {
        setCumulativeRequirements(cumulativeData || [])
      }

    } catch (error) {
      console.error('Error in fetchProductionQueue:', error)
      showError('Failed to load production queue data')
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (operationsUser) {
      fetchProductionQueue()
    }
  }, [operationsUser])

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  // Start production for an order
  const startProduction = async (orderId: string) => {
    if (!operationsUser) return

    setUpdatingOrder(orderId)
    try {
      const { error } = await supabase
        .rpc('start_order_production', { order_id: orderId })

      if (error) {
        console.error('Error starting production:', error)
        showError('Failed to start production')
        return
      }

      showSuccess('Production started successfully')
      await fetchProductionQueue() // Refresh data

    } catch (error) {
      console.error('Error in startProduction:', error)
      showError('Failed to start production')
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Create purchase order for ingredient
  const createPurchaseOrder = async (
    ingredientId: string,
    ingredientName: string,
    supplierName: string,
    suggestedQuantity: number
  ) => {
    if (!operationsUser) return

    try {
      const { error } = await supabase.rpc('create_purchase_order', {
        ingredient_id: ingredientId,
        supplier_name: supplierName,
        quantity: suggestedQuantity,
        notes: `Auto-generated PO for ${ingredientName} shortage`
      })

      if (error) {
        console.error('Error creating purchase order:', error)
        showError('Failed to create purchase order')
        return
      }

      showSuccess(`Purchase order created for ${ingredientName}`)
      setCreatedPOs(prev => new Set(prev).add(ingredientId))

    } catch (error) {
      console.error('Error in createPurchaseOrder:', error)
      showError('Failed to create purchase order')
    }
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
        showProductGroupView={false}
        onRefresh={fetchProductionQueue}
        onToggleCumulativeView={() => setShowCumulativeView(!showCumulativeView)}
        onToggleProductGroupView={() => {}} // Not implemented in this optimized version
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
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isExpanded={expandedOrders.has(order.id)}
                    onToggleExpand={() => toggleOrderExpansion(order.id)}
                    onStartProduction={startProduction}
                    updatingOrder={updatingOrder}
                    createdPOs={createdPOs}
                  />
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
