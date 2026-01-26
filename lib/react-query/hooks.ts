'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API base URL
const API_BASE = '/api'

// Generic fetch function
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
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

// Dashboard hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiFetch('/admin/dashboard', {
      method: 'POST',
      body: JSON.stringify({
        includeRecentOrders: true,
        includeOrderStats: false,
        includeProductPerformance: false,
        includeRecentActivity: false,
        activityLimit: 10
      })
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
    gcTime: 5 * 60 * 1000, // 5 minutes cache
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
