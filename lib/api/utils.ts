import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
  meta?: {
    fetchedAt?: string
    pagination?: {
      page: number
      limit: number
      hasNext: boolean
      hasPrev: boolean
      total: number
    }
    filters?: Record<string, any>
  }
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export interface CacheParams {
  useCache?: boolean
  cacheTTL?: number
}

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export const cacheSchema = z.object({
  useCache: z.boolean().default(true),
  cacheTTL: z.number().int().min(30).max(3600).default(300)
})

// Generic pagination helper
export function getPaginationParams(page: number, limit: number) {
  const offset = (page - 1) * limit
  return {
    page,
    limit,
    offset,
    hasNext: false, // Will be updated after getting total count
    hasPrev: page > 1
  }
}

// Generic date filter helper
export function getDateFilters(startDate?: string, endDate?: string) {
  const filters: Record<string, any> = {}
  if (startDate) filters.gte = startDate
  if (endDate) filters.lte = endDate
  return filters
}

// Generic cache helper
export class ApiCache {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  
  static get(key: string, ttl: number = 300): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl * 1000) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }
  
  static set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  static clear(): void {
    this.cache.clear()
  }
}

// Generic API response helper
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  details?: string,
  meta?: any
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    details,
    meta: {
      fetchedAt: new Date().toISOString(),
      ...meta
    }
  }
}

// Generic database query helper with error handling
export async function safeDatabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackFn?: () => Promise<T>
): Promise<{ data: T | null; error: any; usedFallback: boolean }> {
  try {
    const result = await queryFn()
    if (result.error) {
      console.warn('Database query failed, using fallback:', result.error.message)
      if (fallbackFn) {
        const fallbackData = await fallbackFn()
        return { data: fallbackData, error: null, usedFallback: true }
      }
      return { data: null, error: result.error, usedFallback: false }
    }
    return { data: result.data, error: null, usedFallback: false }
  } catch (error) {
    console.error('Database query error:', error)
    if (fallbackFn) {
      try {
        const fallbackData = await fallbackFn()
        return { data: fallbackData, error: null, usedFallback: true }
      } catch (fallbackError) {
        return { data: null, error: fallbackError, usedFallback: false }
      }
    }
    return { data: null, error, usedFallback: false }
  }
}

// Common Supabase query builders
export class SupabaseQueryBuilder {
  constructor(private supabase: any) {}
  
  // Generic count query with filters
  async count(table: string, filters: Record<string, any> = {}): Promise<number> {
    let query = this.supabase.from(table).select('*', { count: 'exact', head: true })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (value.gte) query = query.gte(key, value.gte)
        if (value.lte) query = query.lte(key, value.lte)
        if (value.eq) query = query.eq(key, value.eq)
        if (value.neq) query = query.neq(key, value.neq)
        if (value.ilike) query = query.ilike(key, value.ilike)
      } else {
        query = query.eq(key, value)
      }
    })
    
    const { count } = await query
    return count || 0
  }
  
  // Generic select with pagination and filters
  async selectWithPagination(
    table: string,
    select: string = '*',
    pagination: PaginationParams,
    filters: Record<string, any> = {},
    orderBy: string = 'created_at',
    ascending: boolean = false
  ): Promise<{ data: any[]; count: number }> {
    const { page, limit, offset } = getPaginationParams(pagination.page, pagination.limit)
    
    let query = this.supabase
      .from(table)
      .select(select, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order(orderBy, { ascending })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (value.gte) query = query.gte(key, value.gte)
        if (value.lte) query = query.lte(key, value.lte)
        if (value.eq) query = query.eq(key, value.eq)
        if (value.neq) query = query.neq(key, value.neq)
        if (value.ilike) query = query.ilike(key, value.ilike)
      } else {
        query = query.eq(key, value)
      }
    })
    
    const { data, count } = await query
    return { data: data || [], count: count || 0 }
  }
}

// RPC function helper
export async function callRpcFunction<T>(
  supabase: any,
  functionName: string,
  params: Record<string, any> = {}
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc(functionName, params)
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Common validation helper
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: any
): { success: boolean; data?: T; error?: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map(issue => issue.message).join(', ')
    }
  }
  return { success: true, data: result.data }
}

// Error handling helper
export function handleApiError(error: any, context: string = 'API'): ApiResponse {
  console.error(`${context} error:`, error)
  return createApiResponse(
    false,
    null,
    'Internal server error',
    error instanceof Error ? error.message : 'Unknown error'
  )
}
