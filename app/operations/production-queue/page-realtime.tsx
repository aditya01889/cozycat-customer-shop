'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import dynamic from 'next/dynamic'

// Import real-time hooks
import { useProductionQueueRealtime, useRealtimeNotifications } from '@/hooks/useRealtimeData'
import { useConnectionStatus } from '@/lib/realtime/supabase-subscriptions'

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

export default function ProductionQueueRealtime() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const { isConnected } = useConnectionStatus()
  const { notifications, clearNotifications, unreadCount } = useRealtimeNotifications()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [showCumulativeView, setShowCumulativeView] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [createdPOs, setCreatedPOs] = useState<Set<string>>(new Set())
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [operationsUser, setOperationsUser] = useState<any>(null)
  const [cumulativeRequirements, setCumulativeRequirements] = useState<CumulativeRequirements[]>([])

  // Real-time data hooks
  const { data: orders, optimisticUpdate } = useProductionQueueRealtime([])

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

  // Fetch cumulative requirements
  const fetchCumulativeRequirements = async () => {
    if (!operationsUser) return

    try {
      const { data, error } = await supabase
        .rpc('get_cumulative_ingredient_requirements')

      if (error) {
        console.error('Error fetching cumulative requirements:', error)
      } else {
        setCumulativeRequirements(data || [])
      }
    } catch (error) {
      console.error('Error in fetchCumulativeRequirements:', error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (operationsUser) {
      fetchCumulativeRequirements()
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

  // Start production with optimistic update
  const startProduction = async (orderId: string) => {
    if (!operationsUser) return

    setUpdatingOrder(orderId)

    // Optimistic update
    await optimisticUpdate({
      optimisticData: {
        id: orderId,
        status: 'processing'
      } as any,
      actualUpdate: async () => {
        const { error } = await supabase
          .rpc('start_order_production', { order_id: orderId })

        if (error) {
          throw new Error(error.message)
        }
      },
      rollback: async () => {
        // Rollback would be handled by the real-time subscription
        console.log('Rollback handled by real-time subscription')
      },
      onSuccess: () => {
        showSuccess('Production started successfully')
      },
      onError: (error) => {
        showError('Failed to start production')
        console.error('Production start error:', error)
      }
    })

    setUpdatingOrder(null)
  }

  // Create purchase order with optimistic update
  const createPurchaseOrder = async (
    ingredientId: string,
    ingredientName: string,
    supplierName: string,
    suggestedQuantity: number
  ) => {
    if (!operationsUser) return

    // Optimistic update for PO creation
    await optimisticUpdate({
      optimisticData: {
        id: ingredientId,
        po_status: 'created'
      } as any,
      actualUpdate: async () => {
        const { error } = await supabase.rpc('create_purchase_order', {
          ingredient_id: ingredientId,
          supplier_name: supplierName,
          quantity: suggestedQuantity,
          notes: `Auto-generated PO for ${ingredientName} shortage`
        })

        if (error) {
          throw new Error(error.message)
        }
      },
      rollback: async () => {
        // Rollback would be handled by the real-time subscription
        console.log('PO rollback handled by real-time subscription')
      },
      onSuccess: () => {
        showSuccess(`Purchase order created for ${ingredientName}`)
        setCreatedPOs(prev => new Set(prev).add(ingredientId))
      },
      onError: (error) => {
        showError('Failed to create purchase order')
        console.error('PO creation error:', error)
      }
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading production queue...</p>
          <div className="mt-2 text-sm text-gray-500">
            {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Banner */}
      <div className={`${
        isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      } border-b px-4 py-2`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
            </span>
          </div>
          
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear {unreadCount} notifications
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <ProductionQueueHeader
        loading={loading}
        showCumulativeView={showCumulativeView}
        showProductGroupView={false}
        onRefresh={() => window.location.reload()}
        onToggleCumulativeView={() => setShowCumulativeView(!showCumulativeView)}
        onToggleProductGroupView={() => {}} // Not implemented in this version
      />

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Recent Activity ({notifications.length})
            </h3>
            <div className="space-y-1">
              {notifications.slice(0, 3).map((notification, index) => (
                <div key={notification.id} className="text-xs text-blue-700">
                  {notification.message} - {notification.timestamp.toLocaleTimeString()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <p className="text-gray-500">
                  All orders are either completed or don't require production
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  {isConnected ? '🔄 Real-time updates active' : '⏳ Waiting for connection...'}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Production Queue ({orders.length} orders)
                  </h3>
                  <div className="text-sm text-gray-500">
                    {isConnected ? '🔄 Live updates' : '🔴 Offline'}
                  </div>
                </div>
                
                {orders
                  .sort((a: any, b: any) => a.priority_order - b.priority_order)
                  .map((order: any) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isExpanded={expandedOrders.has(order.id)}
                      onToggleExpand={() => toggleOrderExpansion(order.id)}
                      onStartProduction={startProduction}
                      updatingOrder={updatingOrder}
                      createdPOs={createdPOs}
                    />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
