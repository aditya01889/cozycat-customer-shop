'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Users, Search, Filter, ArrowUpDown, Eye, Edit, Trash2, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast/ToastProvider'
import { ErrorHandler, ErrorType } from '@/lib/errors/error-handler'

type User = Database['public']['Tables']['customers']['Row'] | Database['public']['Tables']['profiles']['Row']

export default function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching users data...')
      
      // Use pre-configured client-side Supabase client
      // const supabase = createClient() // Remove this line
      
      // Fetch both profiles and customers
      const [profilesResult, customersResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
      ])

      console.log('🔍 Profiles result:', profilesResult)
      console.log('🔍 Customers result:', customersResult)

      if (profilesResult.error) {
        console.error('Profiles error:', profilesResult.error)
        throw profilesResult.error
      }
      if (customersResult.error) {
        console.error('Customers error:', customersResult.error)
        throw customersResult.error
      }

      // Combine and deduplicate users
      const allUsers = [...(profilesResult.data || []), ...(customersResult.data || [])]
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex((u) => u.id === user.id)
      )

      console.log('🔍 Combined users:', uniqueUsers)
      setUsers(uniqueUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      const appError = ErrorHandler.fromError(error)
      showToast(appError.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = (user as any).full_name || ''
    const email = user.email || ''
    const phone = (user as any).phone || ''
    
    return (
      fullName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      phone.toLowerCase().includes(searchLower)
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortBy as keyof User] || ''
    let bValue: any = b[sortBy as keyof User] || ''
    
    if (sortBy === 'created_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleUpdateUser = async (user: User) => {
    try {
      // Use pre-configured client-side Supabase client
      
      // Update user in profiles table
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          full_name: (user as any).full_name,
          phone: (user as any).phone,
          role: (user as any).role
        })
        .eq('id', user.id)

      // If user is also in customers table, update there too
      const { error: customersError } = await supabase
        .from('customers')
        .update({
          customer_name: (user as any).full_name,
          phone: (user as any).phone
        })
        .eq('id', user.id)

      if (profilesError && customersError) {
        throw profilesError
      }

      showToast('User updated successfully', 'success')
      fetchUsers()
      setShowEditModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      const appError = ErrorHandler.fromError(error)
      showToast(appError.message, 'error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // Use pre-configured client-side Supabase client
      // const supabase = createClient() // Remove this line
      
      // Try to delete from both tables
      const [profilesResult, customersResult] = await Promise.all([
        supabase.from('profiles').delete().eq('id', userId),
        supabase.from('customers').delete().eq('id', userId)
      ])

      if (profilesResult.error && customersResult.error) {
        throw profilesResult.error
      }

      showToast('User deleted successfully', 'success')
      fetchUsers()
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      const appError = ErrorHandler.fromError(error)
      showToast(appError.message, 'error')
    }
  }

  const getUserRole = (user: User) => {
    return (user as any).role || 'customer'
  }

  const getUserDisplayName = (user: User) => {
    return (user as any).full_name || (user as any).customer_name || 'Unknown User'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-500">Manage all users and customers</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {sortedUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('full_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === 'full_name' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'full_name' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Email
                      {sortBy === 'email' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'email' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('role')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Role
                      {sortBy === 'role' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'role' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th 
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Joined
                      {sortBy === 'created_at' && (
                        sortOrder === 'asc' ? 
                          <span className="ml-1 text-blue-600">↑</span> : 
                          <span className="ml-1 text-blue-600">↓</span>
                      )}
                      {sortBy !== 'created_at' && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserDisplayName(user)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getUserRole(user) === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : getUserRole(user) === 'partner'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getUserRole(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(user as any).phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowViewModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View user"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditModal(true)
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding some users'}
            </p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{getUserDisplayName(selectedUser)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900">{getUserRole(selectedUser)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{(selectedUser as any).phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Joined</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={(selectedUser as any).full_name || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={(selectedUser as any).phone || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={(selectedUser as any).role || 'customer'}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as 'customer' | 'admin' | 'partner' | 'operations'})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="partner">Partner</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUser(selectedUser)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete {getUserDisplayName(selectedUser)}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
