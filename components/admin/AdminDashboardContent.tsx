'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardStats } from '@/lib/react-query/hooks'
import Link from 'next/link'
import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  LogOut,
  Clock
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  recentOrders: any[]
  totalRevenue: number
  pendingOrders: number
}

export default function AdminDashboardContent() {
  console.log('🚀 AdminDashboardContent component rendered')
  
  const { user, signOut } = useAuth()
  const { data: dashboardData, isLoading, error, refetch } = useDashboardStats()

  console.log('🔍 Admin Dashboard - Data:', {
    isLoading,
    hasError: !!error,
    hasData: !!dashboardData,
    dataKeys: dashboardData ? Object.keys(dashboardData) : null,
    error: error?.message,
    fullData: dashboardData
  })

  // Handle the actual data structure from RPC function
  const responseData = (dashboardData as any)?.data || {}
  const rpcData = responseData.dashboardStats || {}
  console.log('🔍 Full Response Data:', responseData)
  console.log('🔍 RPC Data Structure:', rpcData)
  console.log('🔍 RPC Data Keys:', Object.keys(rpcData))
  
  const stats = {
    totalProducts: rpcData.total_products || rpcData.totalProducts || 0,
    totalOrders: rpcData.total_orders || rpcData.totalOrders || 0,
    totalUsers: rpcData.total_users || rpcData.totalUsers || 0,
    recentOrders: rpcData.recent_orders || rpcData.recentOrders || [],
    totalRevenue: rpcData.total_revenue || rpcData.totalRevenue || 0,
    pendingOrders: rpcData.pending_orders || rpcData.pendingOrders || 0
  }

  console.log('🔍 Admin Dashboard - Parsed Stats:', stats)

  // Safe number formatting function
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0'
    return num.toLocaleString()
  }

  const formatCurrency = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '₹0'
    return `₹${num.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading dashboard</div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="text-sm text-gray-500">
                Welcome back, {user?.user_metadata?.name || user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProducts)}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manage Users</p>
                <p className="text-lg font-semibold text-gray-900">View all users</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-lg font-semibold text-gray-900">Manage products</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-lg font-semibold text-gray-900">View orders</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analytics</p>
                <p className="text-lg font-semibold text-gray-900">View analytics</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.slice(0, 5).map((order: any, index: number) => (
                  <div key={order.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{order.customer_name || 'Unknown Customer'}</p>
                      <p className="text-sm text-gray-500">Order #{order.order_number || order.id?.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <p className="text-xs text-gray-500">{order.status || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
