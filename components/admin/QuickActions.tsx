'use client'

import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react'
import Link from 'next/link'

interface QuickActionsProps {
  className?: string
}

export default function QuickActions({ className = '' }: QuickActionsProps) {
  const actions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      title: 'Analytics',
      description: 'View sales and performance analytics',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
    }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 transition-colors ${action.color}`}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-5 w-5" />
              <div>
                <p className="font-medium text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </div>
  )
}
