'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface RecentOrder {
  id: string
  customer_email: string
  total_amount: number
  status: string
  created_at: string
}

interface RecentOrdersProps {
  orders: RecentOrder[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '₹0'
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <p className="text-gray-500 text-center py-8">No recent orders found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <Link
          href="/admin/orders"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">{order.customer_email}</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
