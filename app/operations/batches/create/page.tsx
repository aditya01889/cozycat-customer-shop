'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Package,
  Plus,
  Minus,
  Save,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  order_items: Array<{
    id: string
    product_name: string
    quantity: number
    weight_grams: number
    unit_price: number
  }>
}

interface BatchItem {
  order_item_id: string
  quantity: number
  notes: string
}

export default function CreateBatch() {
  return (
    <Suspense>
      <CreateBatchInner />
    </Suspense>
  )
}

function CreateBatchInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('order') || ''
  
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orderId || '')
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [batchNotes, setBatchNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [operationsUser, setOperationsUser] = useState<any>(null)

  useEffect(() => {
    checkOperationsAccess()
    fetchPendingOrders()
  }, [])

  useEffect(() => {
    if (selectedOrderId) {
      loadOrderItems(selectedOrderId)
    }
  }, [selectedOrderId])

  const checkOperationsAccess = async () => {
    const opsUser = await getOperationsUserClient()
    if (!opsUser) {
      window.location.href = '/'
      return
    }
    setOperationsUser(opsUser)
  }

  const fetchPendingOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_items (
            id,
            quantity,
            unit_price,
            product_variant:product_variants (
              weight_grams,
              product:products (name)
            )
          )
        `)
        .eq('status', 'ready_production')
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedOrders = (data || []).map((order: any) => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          product_name: item.product_variant?.product?.name || 'Unknown Product',
          weight_grams: item.product_variant?.weight_grams || 0
        }))
      }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrderItems = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      const items = order.order_items.map(item => ({
        order_item_id: item.id,
        quantity: item.quantity,
        notes: ''
      }))
      setBatchItems(items)
    }
  }

  const updateBatchItem = (orderItemId: string, field: keyof BatchItem, value: string | number) => {
    setBatchItems(prev => 
      prev.map(item => 
        item.order_item_id === orderItemId 
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const calculateTotalQuantity = () => {
    return batchItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const createBatch = async () => {
    if (!selectedOrderId || batchItems.length === 0) {
      alert('Please select an order and add items to the batch')
      return
    }

    try {
      setCreating(true)
      
      // Generate batch number
      const batchNumber = 'BATCH-' + Date.now().toString().slice(-8)

      // Create production batch
      const { data: batch, error: batchError } = await supabase
        .from('production_batches')
        .insert({
          batch_number: batchNumber,
          status: 'in_progress',
          notes: batchNotes,
          created_by: user?.id,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (batchError) throw batchError

      // Update order items with batch ID
      const { error: itemsError } = await supabase
        .from('order_items')
        .update({ batch_id: batch.id })
        .in('id', batchItems.map(item => item.order_item_id))

      if (itemsError) throw itemsError

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'in_production',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrderId)

      if (orderError) throw orderError

      // Redirect to batch details
      router.push(`/operations/batches/${batch.id}`)
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Failed to create batch. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading orders...</p>
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
              <Link href="/operations/production-queue" className="text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                Back to Production Queue
              </Link>
              <span className="text-2xl mr-3">🏭</span>
              <h1 className="text-xl font-bold text-gray-900">Create Production Batch</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            Select Order
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Ready for Production</h3>
              <p className="text-gray-600 mb-4">
                Orders must be confirmed and marked as ready for production before creating batches.
              </p>
              <Link
                href="/operations/production-queue"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Production Queue
              </Link>
            </div>
          ) : (
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an order...</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.order_number} - {order.order_items.length} items
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Batch Items */}
        {batchItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 text-purple-600 mr-2" />
              Batch Items
            </h2>
            
            <div className="space-y-4">
              {batchItems.map((item, index) => {
                const orderItem = orders
                  .find(o => o.id === selectedOrderId)
                  ?.order_items.find(oi => oi.id === item.order_item_id)
                
                return (
                  <div key={item.order_item_id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {orderItem?.product_name || 'Unknown Product'}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {orderItem?.weight_grams}g each
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Order Quantity
                        </label>
                        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                          {orderItem?.quantity || 0}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Batch Quantity
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateBatchItem(item.order_item_id, 'quantity', Math.max(1, item.quantity - 1))}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateBatchItem(item.order_item_id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded mx-2"
                          />
                          <button
                            onClick={() => updateBatchItem(item.order_item_id, 'quantity', item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateBatchItem(item.order_item_id, 'notes', e.target.value)}
                          placeholder="Special instructions..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Batch Notes */}
        {batchItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch Notes</h2>
            <textarea
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              rows={4}
              placeholder="Add any special instructions or notes for this production batch..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Summary and Actions */}
        {batchItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Batch Summary</h3>
                <p className="text-gray-600">
                  Total Items: {calculateTotalQuantity()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Ready to Start
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link
                href="/operations/production-queue"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                onClick={createBatch}
                disabled={creating}
                className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                    Creating Batch...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Batch
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
