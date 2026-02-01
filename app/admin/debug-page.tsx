'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import AdminAuth from '@/components/AdminAuth'

export default function DebugAdminDashboard() {
  return (
    <AdminAuth>
      <DebugAdminDashboardContent />
    </AdminAuth>
  )
}

function DebugAdminDashboardContent() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    debugUserCount()
  }, [])

  const debugUserCount = async () => {
    try {
      console.log('🔍 Debugging user count...')
      
      // Test 1: Direct SQL query
      const { data: directData, error: directError } = await supabase
        .rpc('get_user_count')
      
      console.log('Direct RPC result:', directData, directError)

      // Test 2: Simple profiles query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
      
      console.log('Profiles query result:', profilesData, profilesError)
      console.log('Profiles count:', profilesData?.length)

      // Test 3: Count query (same as dashboard)
      const { count: usersCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      console.log('Count query result:', usersCount, countError)

      // Test 4: Check current user's role
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      console.log('Current auth user:', currentUser)
      console.log('User metadata role:', currentUser?.user_metadata?.role)

      // Test 5: Check JWT
      const { data: jwtData } = await supabase.auth.getSession()
      console.log('JWT session:', jwtData)

      setDebugInfo({
        directCount: directData,
        profilesData: profilesData,
        profilesCount: profilesData?.length,
        countQuery: usersCount,
        currentUser: currentUser,
        userMetadata: currentUser?.user_metadata,
        errors: {
          direct: directError?.message,
          profiles: profilesError?.message,
          count: countError?.message
        }
      })
    } catch (error) {
      console.error('Debug error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setDebugInfo({ error: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard Debug</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Expected vs Actual</h2>
        <div className="space-y-2">
          <p><strong>Expected user count:</strong> 3</p>
          <p><strong>Actual count query:</strong> {debugInfo.countQuery}</p>
          <p><strong>Actual profiles length:</strong> {debugInfo.profilesCount}</p>
          <p><strong>Current user role:</strong> {debugInfo.userMetadata?.role}</p>
        </div>
      </div>
    </div>
  )
}
