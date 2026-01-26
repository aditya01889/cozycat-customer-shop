'use client'

import dynamic from 'next/dynamic'
import AdminAuth from '@/components/AdminAuth'

// Dynamically import the analytics content to reduce initial bundle size
// This component will only be loaded when the admin analytics page is accessed
const AdminAnalyticsContent = dynamic(
  () => import('@/components/admin/AdminAnalyticsContent').then(mod => mod.default),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    ),
    ssr: false // Disable server-side rendering for better performance
  }
)

export default function AdminAnalyticsPage() {
  return (
    <AdminAuth>
      <AdminAnalyticsContent />
    </AdminAuth>
  )
}
