'use client'

import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'
import AdminAuth from '@/components/AdminAuth'

// Dynamically import the dashboard content to reduce initial bundle size
// This component will only be loaded when the admin dashboard is accessed
const AdminDashboardContent = dynamic(
  () => import('@/components/admin/AdminDashboardContent').then(mod => mod.default),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    ),
    ssr: false // Disable server-side rendering for better performance
  }
)

export default function AdminDashboard() {
  return (
    <AdminAuth>
      <AdminDashboardContent />
    </AdminAuth>
  )
}
