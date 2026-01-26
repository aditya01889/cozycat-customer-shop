import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/components/Toast/ToastProvider'
import { 
  realtimeManager, 
  SubscriptionCallback, 
  useConnectionStatus,
  performOptimisticUpdate,
  OptimisticUpdateConfig
} from '@/lib/realtime/supabase-subscriptions'

// Generic hook for real-time data
export function useRealtimeData<T>(
  subscriptionId: string,
  table: string,
  initialData: T[],
  filter?: string,
  options?: {
    enableOptimisticUpdates?: boolean
    showToastOnError?: boolean
    showToastOnSuccess?: boolean
  }
) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useConnectionStatus()
  const { showSuccess, showError } = useToast()
  const subscriptionRef = useRef<string | null>(null)

  const {
    enableOptimisticUpdates = false,
    showToastOnError = true,
    showToastOnSuccess = false
  } = options || {}

  const handleRealtimeUpdate = useCallback<SubscriptionCallback<T>>((payload) => {
    console.log(`🔄 Real-time update for ${table}:`, payload)
    
    try {
      switch (payload.event) {
        case 'INSERT':
          if (payload.new) {
            setData(prev => [...prev, payload.new as T])
            if (showToastOnSuccess) {
              showSuccess(`New ${table.slice(0, -1)} added`)
            }
          }
          break
          
        case 'UPDATE':
          if (payload.new) {
            setData(prev => 
              prev.map(item => 
                (item as any).id === (payload.new as any).id 
                  ? payload.new as T 
                  : item
              )
            )
            if (showToastOnSuccess) {
              showSuccess(`${table.slice(0, -1)} updated`)
            }
          }
          break
          
        case 'DELETE':
          if (payload.old) {
            setData(prev => 
              prev.filter(item => (item as any).id !== (payload.old as any).id)
            )
            if (showToastOnSuccess) {
              showSuccess(`${table.slice(0, -1)} deleted`)
            }
          }
          break
      }
    } catch (err) {
      console.error('Error handling real-time update:', err)
      if (showToastOnError) {
        showError('Failed to update data')
      }
    }
  }, [table, showToastOnSuccess, showToastOnError, showSuccess, showError])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isConnected) {
      console.log('⏳ Waiting for connection before subscribing...')
      return
    }

    try {
      subscriptionRef.current = subscriptionId
      realtimeManager.subscribe(subscriptionId, table, handleRealtimeUpdate, filter)
      console.log(`✅ Subscribed to ${table} real-time updates`)
      
      return () => {
        if (subscriptionRef.current) {
          realtimeManager.unsubscribe(subscriptionRef.current)
          subscriptionRef.current = null
          console.log(`🔌 Unsubscribed from ${table} real-time updates`)
        }
      }
    } catch (err) {
      console.error('Failed to subscribe to real-time updates:', err)
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    }
  }, [subscriptionId, table, filter, handleRealtimeUpdate, isConnected])

  // Optimistic update function
  const optimisticUpdate = useCallback(async (config: Omit<OptimisticUpdateConfig<T>, 'id' | 'table'>) => {
    if (!enableOptimisticUpdates) {
      await config.actualUpdate()
      return
    }

    const id = `${Date.now()}-${Math.random()}`
    await performOptimisticUpdate({
      ...config,
      id,
      table
    })
  }, [enableOptimisticUpdates, table])

  return {
    data,
    setData,
    loading,
    error,
    isConnected,
    optimisticUpdate
  }
}

// Hook for production queue real-time updates
export function useProductionQueueRealtime(initialData: any[] = []) {
  return useRealtimeData(
    'production-queue',
    'production_queue',
    initialData,
    'status=eq.pending',
    {
      enableOptimisticUpdates: true,
      showToastOnSuccess: true,
      showToastOnError: true
    }
  )
}

// Hook for inventory real-time updates
export function useInventoryRealtime(initialData: any[] = []) {
  return useRealtimeData(
    'inventory',
    'ingredients',
    initialData,
    undefined,
    {
      enableOptimisticUpdates: true,
      showToastOnSuccess: false,
      showToastOnError: true
    }
  )
}

// Hook for orders real-time updates
export function useOrdersRealtime(initialData: any[] = []) {
  return useRealtimeData(
    'orders',
    'orders',
    initialData,
    undefined,
    {
      enableOptimisticUpdates: true,
      showToastOnSuccess: true,
      showToastOnError: true
    }
  )
}

// Hook for dashboard real-time updates
export function useDashboardRealtime() {
  const [stats, setStats] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { isConnected } = useConnectionStatus()

  useEffect(() => {
    if (!isConnected) return

    const subscriptionId = 'dashboard-realtime'
    
    const handleOrderUpdate = () => {
      setLastUpdated(new Date())
      // Trigger dashboard refresh
      console.log('📊 Dashboard: Order update detected')
    }

    const handleInventoryUpdate = () => {
      setLastUpdated(new Date())
      // Trigger dashboard refresh
      console.log('📊 Dashboard: Inventory update detected')
    }

    // Subscribe to multiple tables
    realtimeManager.subscribe(`${subscriptionId}-orders`, 'orders', handleOrderUpdate)
    realtimeManager.subscribe(`${subscriptionId}-inventory`, 'ingredients', handleInventoryUpdate)

    return () => {
      realtimeManager.unsubscribe(`${subscriptionId}-orders`)
      realtimeManager.unsubscribe(`${subscriptionId}-inventory`)
    }
  }, [isConnected])

  return {
    stats,
    lastUpdated,
    isConnected
  }
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const { isConnected } = useConnectionStatus()

  useEffect(() => {
    if (!isConnected) return

    const subscriptionId = 'notifications'
    
    const handleNotification = (payload: any) => {
      const notification = {
        id: Date.now().toString(),
        type: payload.event,
        table: payload.table,
        message: `${payload.event} on ${payload.table}`,
        timestamp: new Date(),
        data: payload
      }
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
    }

    // Subscribe to critical tables
    const criticalTables = ['orders', 'production_queue', 'ingredients']
    
    criticalTables.forEach(table => {
      realtimeManager.subscribe(`${subscriptionId}-${table}`, table, handleNotification)
    })

    return () => {
      criticalTables.forEach(table => {
        realtimeManager.unsubscribe(`${subscriptionId}-${table}`)
      })
    }
  }, [isConnected])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    clearNotifications,
    unreadCount: notifications.length
  }
}
