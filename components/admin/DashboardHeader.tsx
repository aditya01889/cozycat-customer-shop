'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  userName?: string
  onSignOut: () => void
}

export default function DashboardHeader({ userName, onSignOut }: DashboardHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <span className="text-sm text-gray-500">
              Welcome back, {userName}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
