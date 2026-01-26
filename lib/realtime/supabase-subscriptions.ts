import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// Subscription types
export type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface SubscriptionCallback<T = any> {
  (payload: {
    event: SubscriptionEvent
    schema: string
    table: string
    commit_timestamp: string
    eventType: SubscriptionEvent
    new?: T
    old?: T
  }): void
}

// Real-time subscription manager
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, { callback: SubscriptionCallback; table: string }> = new Map()

  // Subscribe to table changes
  subscribe<T = any>(
    subscriptionId: string,
    table: string,
    callback: SubscriptionCallback<T>,
    filter?: string
  ): RealtimeChannel {
    // Remove existing subscription if it exists
    if (this.channels.has(subscriptionId)) {
      this.unsubscribe(subscriptionId)
    }

    const channelName = `realtime-${table}-${subscriptionId}`
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        callback as any
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${table} changes (${subscriptionId})`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to ${table} (${subscriptionId})`)
        }
      })

    this.channels.set(subscriptionId, channel)
    this.subscriptions.set(subscriptionId, { callback, table })

    return channel
  }

  // Unsubscribe from a specific subscription
  unsubscribe(subscriptionId: string): void {
    const channel = this.channels.get(subscriptionId)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(subscriptionId)
      this.subscriptions.delete(subscriptionId)
      console.log(`🔌 Unsubscribed from ${subscriptionId}`)
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.channels.forEach((channel, subscriptionId) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.subscriptions.clear()
    console.log('🔌 Unsubscribed from all real-time subscriptions')
  }

  // Get active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys())
  }

  // Get subscription info
  getSubscriptionInfo(subscriptionId: string): { table: string } | null {
    const subscription = this.subscriptions.get(subscriptionId)
    return subscription ? { table: subscription.table } : null
  }
}

// Global realtime manager instance
export const realtimeManager = new RealtimeManager()

// Specific subscription hooks for common use cases
export const subscribeToOrders = (
  subscriptionId: string,
  callback: SubscriptionCallback,
  filter?: string
) => {
  return realtimeManager.subscribe(subscriptionId, 'orders', callback, filter)
}

export const subscribeToProductionQueue = (
  subscriptionId: string,
  callback: SubscriptionCallback,
  filter?: string
) => {
  return realtimeManager.subscribe(subscriptionId, 'production_queue', callback, filter)
}

export const subscribeToIngredients = (
  subscriptionId: string,
  callback: SubscriptionCallback,
  filter?: string
) => {
  return realtimeManager.subscribe(subscriptionId, 'ingredients', callback, filter)
}

export const subscribeToInventory = (
  subscriptionId: string,
  callback: SubscriptionCallback,
  filter?: string
) => {
  return realtimeManager.subscribe(subscriptionId, 'inventory', callback, filter)
}

export const subscribeToProductionBatches = (
  subscriptionId: string,
  callback: SubscriptionCallback,
  filter?: string
) => {
  return realtimeManager.subscribe(subscriptionId, 'production_batches', callback, filter)
}

// React hook for real-time subscriptions
export function useRealtimeSubscription<T = any>(
  subscriptionId: string,
  table: string,
  callback: SubscriptionCallback<T>,
  filter?: string,
  dependencies: any[] = []
) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const channel = realtimeManager.subscribe(subscriptionId, table, callback, filter)
      setIsSubscribed(true)
      setError(null)

      return () => {
        realtimeManager.unsubscribe(subscriptionId)
        setIsSubscribed(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
      setIsSubscribed(false)
    }
  }, dependencies)

  return { isSubscribed, error }
}

// Optimistic update helpers
export interface OptimisticUpdateConfig<T> {
  id: string
  table: string
  optimisticData: T
  actualUpdate: () => Promise<void>
  rollback: () => Promise<void>
  onSuccess?: () => void
  onError?: (error: any) => void
}

export async function performOptimisticUpdate<T>({
  id,
  table,
  optimisticData,
  actualUpdate,
  rollback,
  onSuccess,
  onError
}: OptimisticUpdateConfig<T>) {
  const subscriptionId = `optimistic-${id}`
  
  try {
    // Create temporary subscription to monitor for conflicts
    let conflictDetected = false
    
    const conflictHandler = (payload: any) => {
      if (payload.event === 'UPDATE' && payload.new?.id === id) {
        conflictDetected = true
      }
    }
    
    realtimeManager.subscribe(subscriptionId, table, conflictHandler)
    
    // Apply optimistic update immediately
    // This would typically update local state
    console.log('🚀 Applying optimistic update:', optimisticData)
    
    // Perform actual update
    await actualUpdate()
    
    // Small delay to check for conflicts
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (conflictDetected) {
      console.warn('⚠️ Conflict detected, rolling back')
      await rollback()
      onError?.(new Error('Conflict detected'))
    } else {
      console.log('✅ Optimistic update successful')
      onSuccess?.()
    }
    
  } catch (error) {
    console.error('❌ Optimistic update failed:', error)
    await rollback()
    onError?.(error)
  } finally {
    realtimeManager.unsubscribe(subscriptionId)
  }
}

// Batch subscription manager for multiple tables
export class BatchSubscriptionManager {
  private subscriptionId: string
  private subscriptions: Map<string, RealtimeChannel> = new Map()

  constructor(subscriptionId: string) {
    this.subscriptionId = subscriptionId
  }

  addSubscription<T = any>(
    table: string,
    callback: SubscriptionCallback<T>,
    filter?: string
  ): void {
    const channel = realtimeManager.subscribe(
      `${this.subscriptionId}-${table}`,
      table,
      callback,
      filter
    )
    this.subscriptions.set(table, channel)
  }

  removeSubscription(table: string): void {
    realtimeManager.unsubscribe(`${this.subscriptionId}-${table}`)
    this.subscriptions.delete(table)
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((_, table) => {
      realtimeManager.unsubscribe(`${this.subscriptionId}-${table}`)
    })
    this.subscriptions.clear()
  }

  getSubscribedTables(): string[] {
    return Array.from(this.subscriptions.keys())
  }
}

// Connection status monitoring
export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastConnected, setLastConnected] = useState<Date | null>(null)

  useEffect(() => {
    const checkConnection = () => {
      const status = supabase.realtime.isConnected()
      setIsConnected(status)
      if (status) {
        setLastConnected(new Date())
      }
    }

    // Check initial status
    checkConnection()

    // Monitor connection changes
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

  return { isConnected, lastConnected }
}
