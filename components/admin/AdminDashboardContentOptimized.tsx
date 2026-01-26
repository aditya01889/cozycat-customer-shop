'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardStats } from '@/lib/react-query/hooks'
import dynamic from 'next/dynamic'

// Dynamically import components for better code splitting
const DashboardHeader = dynamic(() => import('./DashboardHeader'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-16 rounded-lg mb-6"></div>
  )
})

const DashboardStats = dynamic(() => import('./DashboardStats'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
      ))}
    </div>
  )
})

const RecentOrders = dynamic(() => import('./RecentOrders'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  )
})

const QuickActions = dynamic(() => import('./QuickActions'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
  )
})

export default function AdminDashboardContentOptimized() {
  console.log('🚀 AdminDashboardContentOptimized component rendered')
  
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

  const userName = user?.user_metadata?.name || user?.email

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Dynamically loaded */}
      <DashboardHeader 
        userName={userName} 
        onSignOut={signOut} 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Dynamically loaded */}
        <DashboardStats
          totalProducts={stats.totalProducts}
          totalOrders={stats.totalOrders}
          totalUsers={stats.totalUsers}
          totalRevenue={stats.totalRevenue}
          pendingOrders={stats.pendingOrders}
        />

        {/* Two Column Layout for Recent Orders and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders - Dynamically loaded */}
          <RecentOrders orders={stats.recentOrders} />
          
          {/* Quick Actions - Dynamically loaded */}
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
