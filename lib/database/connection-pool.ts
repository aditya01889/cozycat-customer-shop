/**
 * Database connection pooling for improved performance
 * Manages Supabase client connections efficiently
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/env-validation'

interface ConnectionPool {
  client: any
  inUse: boolean
  lastUsed: number
  createdAt: number
}

class DatabaseConnectionPool {
  private pool: ConnectionPool[] = []
  private maxPoolSize: number
  private maxIdleTime: number
  private config: { url: string; serviceRoleKey: string }

  constructor() {
    this.maxPoolSize = parseInt(process.env.DB_POOL_MAX_SIZE || '10')
    this.maxIdleTime = parseInt(process.env.DB_POOL_MAX_IDLE_TIME || '300000') // 5 minutes
    this.config = getSupabaseConfig()
  }

  /**
   * Get a database connection from the pool
   */
  async getConnection(): Promise<any> {
    // Try to reuse an existing connection
    const availableConnection = this.pool.find(conn => !conn.inUse)
    
    if (availableConnection) {
      availableConnection.inUse = true
      availableConnection.lastUsed = Date.now()
      return availableConnection.client
    }

    // Create a new connection if pool isn't full
    if (this.pool.length < this.maxPoolSize) {
      const newClient = createClient(this.config.url, this.config.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const connection: ConnectionPool = {
        client: newClient,
        inUse: true,
        lastUsed: Date.now(),
        createdAt: Date.now()
      }

      this.pool.push(connection)
      return newClient
    }

    // Wait for a connection to become available
    return this.waitForConnection()
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(client: any): void {
    const connection = this.pool.find(conn => conn.client === client)
    
    if (connection) {
      connection.inUse = false
      connection.lastUsed = Date.now()
    }
  }

  /**
   * Wait for an available connection
   */
  private async waitForConnection(): Promise<any> {
    const maxWaitTime = 5000 // 5 seconds max wait
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      const availableConnection = this.pool.find(conn => !conn.inUse)
      
      if (availableConnection) {
        availableConnection.inUse = true
        availableConnection.lastUsed = Date.now()
        return availableConnection.client
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    throw new Error('Database connection timeout: No available connections in pool')
  }

  /**
   * Clean up idle connections
   */
  cleanupIdleConnections(): void {
    const now = Date.now()
    const initialSize = this.pool.length
    
    this.pool = this.pool.filter(connection => {
      const isIdle = !connection.inUse && (now - connection.lastUsed) > this.maxIdleTime
      const isOld = (now - connection.createdAt) > 3600000 // 1 hour max lifetime
      
      if (isIdle || isOld) {
        console.log('🗑️ Cleaning up idle database connection')
        return false
      }
      
      return true
    })
    
    if (this.pool.length < initialSize) {
      console.log(`🧹 Cleaned ${initialSize - this.pool.length} idle connections`)
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    const activeConnections = this.pool.filter(conn => conn.inUse).length
    const idleConnections = this.pool.filter(conn => !conn.inUse).length
    
    return {
      totalConnections: this.pool.length,
      activeConnections,
      idleConnections,
      maxPoolSize: this.maxPoolSize,
      utilizationRate: (activeConnections / this.maxPoolSize) * 100
    }
  }

  /**
   * Close all connections
   */
  async closeAllConnections(): Promise<void> {
    console.log('🔒 Closing all database connections')
    
    // In a real implementation, you'd properly close each connection
    // For Supabase, we just clear the pool
    this.pool = []
  }
}

// Singleton instance
const connectionPool = new DatabaseConnectionPool()

// Clean up idle connections periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    connectionPool.cleanupIdleConnections()
  }, 60000) // Every minute
}

export { connectionPool }

/**
 * Database helper functions with automatic connection management
 */
export class DatabaseHelper {
  /**
   * Execute a query with automatic connection management
   */
  static async executeQuery<T>(
    queryFn: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await connectionPool.getConnection()
    
    try {
      return await queryFn(client)
    } finally {
      connectionPool.releaseConnection(client)
    }
  }

  /**
   * Execute multiple queries in parallel with connection management
   */
  static async executeQueries<T>(
    queryFns: Array<(client: any) => Promise<T>>
  ): Promise<T[]> {
    const client = await connectionPool.getConnection()
    
    try {
      const results = await Promise.all(queryFns.map(fn => fn(client)))
      return results
    } finally {
      connectionPool.releaseConnection(client)
    }
  }

  /**
   * Get database pool statistics
   */
  static getPoolStats() {
    return connectionPool.getPoolStats()
  }

  /**
   * Clean up idle connections
   */
  static cleanupIdleConnections() {
    connectionPool.cleanupIdleConnections()
  }

  /**
   * Close all connections
   */
  static async closeAllConnections() {
    await connectionPool.closeAllConnections()
  }
}
