'use client'

import { Package, ShoppingCart, Users, DollarSign, Clock } from 'lucide-react'

interface DashboardStatsProps {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
}

export default function DashboardStats({
  totalProducts,
  totalOrders,
  totalUsers,
  totalRevenue,
  pendingOrders
}: DashboardStatsProps) {
  // Safe number formatting function
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0'
    return num.toLocaleString()
  }

  const formatCurrency = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '₹0'
    return `₹${num.toLocaleString()}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalProducts)}</p>
          </div>
          <Package className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalOrders)}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalUsers)}</p>
          </div>
          <Users className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-yellow-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(pendingOrders)}</p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </div>
    </div>
  )
}
