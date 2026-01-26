/**
 * Reusable API Utilities for Admin Operations
 * Phase 3.1: API Layer Optimization
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Common pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

// Date filtering schema
export const dateFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

// Search schema
export const searchSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Combined admin query schema
export const adminQuerySchema = paginationSchema.merge(dateFilterSchema).merge(searchSchema)

// Response helper for consistent API responses
export class ApiResponse {
  static success<T>(data: T, meta?: any) {
    return NextResponse.json({
      success: true,
      data,
      meta: {
        fetchedAt: new Date().toISOString(),
        ...meta
      }
    })
  }

  static error(message: string, details?: string, status: number = 500) {
    return NextResponse.json({
      success: false,
      error: message,
      details
    }, { status })
  }

  static paginated<T>(items: T[], pagination: any, meta?: any) {
    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        ...meta
      }
    })
  }
}

// Database query builder helper
export class QueryBuilder {
  private supabase: any
  private table: string

  constructor(table: string) {
    this.table = table
  }

  async getClient() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  // Build paginated query with filters
  async buildPaginatedQuery(
    select: string = '*',
    filters: any = {},
    options: any = {}
  ) {
    const client = await this.getClient()
    let query = client.from(this.table).select(select, { count: 'exact' })

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    // Apply search filter
    if (filters.search) {
      const searchFields = options.searchFields || ['name', 'email', 'id']
      const searchConditions = searchFields.map(field => `${field}.ilike.%${filters.search}%`)
      query = query.or(searchConditions.join(','))
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false }
    query = query.order(sortBy, sortOrder)

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    return query
  }

  // Execute query and return formatted response
  async executePaginatedQuery(
    select: string = '*',
    filters: any = {},
    options: any = {}
  ) {
    try {
      const query = await this.buildPaginatedQuery(select, filters, options)
      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const page = filters.page || 1
      const limit = filters.limit || 20
      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / limit)

      const pagination = {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startIndex: totalItems > 0 ? ((page - 1) * limit) + 1 : 0,
        endIndex: Math.min(page * limit, totalItems)
      }

      return {
        data,
        pagination,
        meta: {
          filters,
          options
        }
      }
    } catch (error) {
      throw new Error(`Query execution failed: ${(error as Error).message}`)
    }
  }
}

// Cache helper for API responses
export class CacheHelper {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  static generateCacheKey(prefix: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as any)
    
    return `${prefix}:${JSON.stringify(sortedParams)}`
  }

  static clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

// Validation helper
export class ValidationHelper {
  static validateAndParse<T>(schema: z.ZodSchema<T>, data: any): T {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        throw new Error(`Validation failed: ${JSON.stringify(details)}`)
      }
      throw error
    }
  }

  static sanitizeString(value: string): string {
    return value.trim().replace(/[<>]/g, '')
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  static validateDate(date: string): boolean {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
}

// Performance monitoring helper
export class PerformanceHelper {
  static async measureTime<T>(
    operation: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now()
    try {
      const result = await operation()
      const duration = Date.now() - start
      console.log(`⏱️ ${label}: ${duration}ms`)
      return { result, duration }
    } catch (error) {
      const duration = Date.now() - start
      console.log(`⏱️ ${label} (failed): ${duration}ms`)
      throw error
    }
  }

  static logSlowQuery(duration: number, threshold: number = 1000) {
    if (duration > threshold) {
      console.warn(`🐌 Slow query detected: ${duration}ms (threshold: ${threshold}ms)`)
    }
  }
}

// Export commonly used combinations
export const createAdminQuery = (table: string) => new QueryBuilder(table)
export const createApiResponse = ApiResponse
export const createCache = CacheHelper
export const createValidator = ValidationHelper
export const createPerfMonitor = PerformanceHelper
