'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// API base URL
const API_BASE = '/api'

// Generic fetch function with proper authentication
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  // Get the current session token
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log('🔍 API Fetch - Session:', {
    hasSession: !!session,
    hasToken: !!session?.access_token,
    userEmail: session?.user?.email,
    endpoint
  })
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  // Add authorization header if session exists
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
    console.log('✅ Authorization header added')
  } else {
    console.log('⚠️  No session token available')
  }
  
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for authentication
    headers,
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ API Error:', error)
    throw new Error(error.error || `API error: ${response.status}`)
  }

  const result = await response.json()
  console.log('✅ API Response:', { success: result.success, hasData: !!result.data })
  return result
}

// Products hooks
export function useProducts(params: {
  category?: string
  search?: string
  limit?: number
  offset?: number
} = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
  ).toString()

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiFetch(`/products/cached?${queryString}`),
    staleTime: 5 * 60 * 1000, // 5 minutes for products
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiFetch(`/products/cached?id=${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for single product
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  })
}

// Dashboard hooks with pagination and filtering
export function useDashboardStats(params: {
  includeRecentOrders?: boolean
  includeOrderStats?: boolean
  includeProductPerformance?: boolean
  includeRecentActivity?: boolean
  activityLimit?: number
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  useCache?: boolean
} = {}) {
  return useQuery({
    queryKey: ['dashboard', 'stats', params],
    queryFn: () => {
      console.log('🚀 Optimized Dashboard Query Function Called')
      
      // Get session first
      return supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('🔍 Session in queryFn:', {
          hasSession: !!session,
          hasToken: !!session?.access_token,
          userEmail: session?.user?.email
        })
        
        if (!session?.access_token) {
          throw new Error('No session token available')
        }
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
        
        return fetch('/api/admin/dashboard', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            includeRecentOrders: params.includeRecentOrders ?? true,
            includeOrderStats: params.includeOrderStats ?? false,
            includeProductPerformance: params.includeProductPerformance ?? false,
            includeRecentActivity: params.includeRecentActivity ?? false,
            activityLimit: params.activityLimit ?? 10,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            startDate: params.startDate,
            endDate: params.endDate,
            useCache: params.useCache ?? true
          })
        }).then(response => {
          console.log('📊 Optimized API Response status:', response.status)
          
          if (!response.ok) {
            return response.json().then(error => {
              console.error('❌ API Error:', error)
              throw new Error(error.error || `API error: ${response.status}`)
            })
          }
          
          return response.json().then(result => {
            console.log('✅ Optimized Dashboard Query Result:', { 
              success: result.success, 
              hasData: !!result.data,
              dataKeys: result.data ? Object.keys(result.data) : null,
              usingRPC: result.meta?.usingRPC
            })
            return result
          })
        })
      })
    },
    staleTime: params.useCache ? 2 * 60 * 1000 : 0, // 2 minutes cache if enabled
    gcTime: params.useCache ? 5 * 60 * 1000 : 0, // 5 minutes cache if enabled
    retry: (failureCount, error) => {
      console.log(`🔄 Optimized Dashboard Query Retry ${failureCount}:`, error.message)
      return failureCount < 2 // Reduced retries for better performance
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10 seconds
    refetchOnWindowFocus: params.useCache ?? false, // Don't refetch on window focus for better performance
  })
}

// Analytics hooks
export function useAnalytics(params: {
  type: 'revenue' | 'customers' | 'products' | 'inventory' | 'orders'
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
  page?: number
  limit?: number
  useCache?: boolean
}) {
  return useQuery({
    queryKey: ['analytics', params.type, params],
    queryFn: () => {
      console.log(`📊 Analytics Query Function Called: ${params.type}`)
      
      return supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) {
          throw new Error('No session token available')
        }
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
        
        return fetch('/api/admin/analytics', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: params.type,
            startDate: params.startDate,
            endDate: params.endDate,
            groupBy: params.groupBy ?? 'day',
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            useCache: params.useCache ?? true
          })
        }).then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.error || `API error: ${response.status}`)
            })
          }
          
          return response.json().then(result => {
            console.log(`✅ Analytics Query Result (${params.type}):`, { 
              success: result.success, 
              hasData: !!result.data,
              dataLength: Array.isArray(result.data) ? result.data.length : 'object'
            })
            return result
          })
        })
      })
    },
    staleTime: params.useCache ? 5 * 60 * 1000 : 0, // 5 minutes cache for analytics
    gcTime: params.useCache ? 10 * 60 * 1000 : 0, // 10 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

// Paginated orders hook
export function usePaginatedOrders(params: {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeCustomer?: boolean
  includeItems?: boolean
} = {}) {
  return useQuery({
    queryKey: ['orders', 'paginated', params],
    queryFn: () => {
      console.log('📦 Paginated Orders Query Function Called')
      
      return supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) {
          throw new Error('No session token available')
        }
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
        
        return fetch('/api/admin/orders/paginated', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status,
            startDate: params.startDate,
            endDate: params.endDate,
            search: params.search,
            sortBy: params.sortBy ?? 'created_at',
            sortOrder: params.sortOrder ?? 'desc',
            includeCustomer: params.includeCustomer ?? true,
            includeItems: params.includeItems ?? false
          })
        }).then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.error || `API error: ${response.status}`)
            })
          }
          
          return response.json().then(result => {
            console.log('✅ Paginated Orders Query Result:', { 
              success: result.success, 
              hasData: !!result.data,
              orderCount: result.data?.orders?.length || 0,
              pagination: result.data?.pagination
            })
            return result
          })
        })
      })
    },
    staleTime: 30 * 1000, // 30 seconds for orders (more dynamic)
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// User profile hooks
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiFetch('/user/profile'),
    staleTime: 10 * 60 * 1000, // 10 minutes for user profile
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { full_name?: string; phone?: string }) =>
      apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

// Orders hooks
export function useUserOrders() {
  return useQuery({
    queryKey: ['user', 'orders'],
    queryFn: () => apiFetch('/user/orders'),
    staleTime: 2 * 60 * 1000, // 2 minutes for orders
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

// Admin hooks
export function useAdminProfiles(params: {
  role?: string
  page?: number
  limit?: number
} = {}) {
  return useQuery({
    queryKey: ['admin', 'profiles', params],
    queryFn: () => apiFetch('/admin/get-profiles', {
      method: 'POST',
      body: JSON.stringify({
        page: params.page || 1,
        limit: params.limit || 20,
        role: params.role
      })
    }),
    staleTime: 3 * 60 * 1000, // 3 minutes for admin data
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

// Cart hooks
export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiFetch('/cart'),
    staleTime: 1 * 60 * 1000, // 1 minute for cart (more dynamic)
    gcTime: 2 * 60 * 1000, // 2 minutes cache
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) =>
      apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate and refetch cart
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { item_id: string; quantity: number }) =>
      apiFetch('/cart/update', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item_id: string) =>
      apiFetch(`/cart/remove/${item_id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

// Utility hook for prefetching data
export function usePrefetchProducts() {
  const queryClient = useQueryClient()

  return (params: { category?: string; search?: string } = {}) => {
    queryClient.prefetchQuery({
      queryKey: ['products', params],
      queryFn: () => apiFetch(`/products/cached?${new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString()}`),
      staleTime: 5 * 60 * 1000,
    })
  }
}

// Utility hook for invalidating multiple queries
export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
    invalidateCart: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  }
}
