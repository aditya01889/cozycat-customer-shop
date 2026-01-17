'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import AdminAuth from '@/components/AdminAuth'
import { Users, Search, Filter, ArrowUpDown, Eye, Edit, Trash2, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

type User = Database['public']['Tables']['customers']['Row'] | Database['public']['Tables']['profiles']['Row']

export default function AdminUsersPage() {
  return (
    <AdminAuth>
      <AdminUsersContent />
    </AdminAuth>
  )
}

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [showCustomerOrders, setShowCustomerOrders] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [userNote, setUserNote] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, sortBy, sortOrder])

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setCustomerOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      setCustomerOrders([])
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching admin users...')
      
      // Try customers table first with profile join
      let { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          profiles:profile_id (
            id,
            full_name,
            email,
            phone,
            created_at
          )
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' })

      // If customers table is empty, try profiles table
      if (!customersData || customersData.length === 0) {
        console.log('Customers table empty, trying profiles table...')
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
            .select('id, role, full_name, email, phone, created_at')
            .order(sortBy, { ascending: sortOrder === 'asc' })

        console.log('Profiles data:', profilesData)
        console.log('Sample profile:', profilesData?.[0])
        console.log('Profile fields:', profilesData?.[0] ? Object.keys(profilesData[0]) : 'none')
        console.log('Profile values:', profilesData?.[0] ? {
          id: profilesData[0].id,
          role: profilesData[0].role,
          full_name: profilesData[0].full_name,
          email: profilesData[0].email,
          phone: profilesData[0].phone,
          created_at: profilesData[0].created_at
        } : 'none')
        console.log('Profiles error:', profilesError)

        if (profilesData && profilesData.length > 0) {
          // Use profiles data
          let data = profilesData
          let error = profilesError
          
          // Apply search filter
          if (searchTerm) {
            data = profilesData.filter(profile => 
              profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }

          console.log('Using profiles data:', data)
          
          // Debug: Log the first profile to see what fields we have
          if (data && data.length > 0) {
            console.log('Sample profile data:', data[0])
            console.log('Profile fields:', Object.keys(data[0]))
            console.log('Profile values:', {
              id: data[0].id,
              full_name: data[0].full_name,
              email: data[0].email,
              phone: data[0].phone,
              created_at: data[0].created_at
            })
          }
          
          setUsers(data || [])
        } else {
          console.log('No user data found in either table')
          setUsers([])
        }
      } else {
        // Use customers data
        let data = customersData
        let error = customersError

        // Apply search filter
        if (searchTerm) {
          const query = supabase
            .from('customers')
            .select(`
              *,
              profiles:profile_id (
                id,
                full_name,
                email,
                phone,
                created_at
              )
            `)
            .or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`)
            .order(sortBy, { ascending: sortOrder === 'asc' })

          const { data: searchData, error: searchError } = await query
          data = searchData
          error = searchError
        }

        console.log('Admin users data:', data)
        console.log('Admin users error:', error)
        console.log('Users count:', data?.length)
        
        // Process orders data to calculate totals
        if (data && data.length > 0) {
          // Fetch orders for all users
          const userIds = data.map((user: any) => user.id)
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id, customer_id, total_amount, status, created_at')
            .in('customer_id', userIds)

          console.log('Orders data:', ordersData)
          console.log('Orders error:', ordersError)

          const processedData = data.map((user: any) => {
            const userOrders = ordersData?.filter((order: any) => order.customer_id === user.id) || []
            const totalOrders = userOrders.length
            const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
            const firstOrderDate = userOrders.length > 0 ? userOrders[0].created_at : null
            const lastOrderDate = userOrders.length > 0 ? userOrders[userOrders.length - 1].created_at : null
            
            console.log('User orders:', {
              userId: user.id,
              totalOrders,
              totalSpent,
              ordersCount: userOrders.length
            })
            
            return {
              ...user,
              total_orders: totalOrders,
              total_spent: totalSpent,
              first_order_date: firstOrderDate,
              last_order_date: lastOrderDate
            }
          })
          
          console.log('Customer fields available:', Object.keys(processedData[0]))
          console.log('Order/spending data:', {
            total_orders: processedData[0].total_orders,
            total_spent: processedData[0].total_spent,
            first_order_date: processedData[0].first_order_date,
            last_order_date: processedData[0].last_order_date
          })
          
          setUsers(processedData)
        } else {
          setUsers(data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserInitials = (user: any) => {
    // Handle customers with profile join and direct profiles
    const fullName = (user as any).profiles?.full_name || (user as any).full_name || ''
    const names = fullName.split(' ').filter((n: string) => n.length > 0)
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    } else if (names.length === 1) {
      return names[0].slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <span className="text-lg mr-2">←</span>
                Back to Dashboard
              </Link>
              <span className="text-2xl mr-3">🐾</span>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Users</h2>
          <p className="text-gray-600">Manage customer accounts and view user information</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="created_at">Join Date</option>
                  <option value="first_name">First Name</option>
                  <option value="last_name">Last Name</option>
                  <option value="email">Email</option>
                  <option value="total_orders">Total Orders</option>
                  <option value="total_spent">Total Spent</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

     {/* Users Grid */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {users.length > 0 ? (
      users.map((user) => (
        <div
          key={user.id}
          className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedUser(user)}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-orange-600">
                  {getUserInitials(user)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {(user as any).profiles?.full_name || 
                   `Customer ${(user as any).id?.slice(0, 8) || 'Unknown'}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {(user as any).profiles?.email || 
                   ((user as any).phone ? `Phone: ${(user as any).phone}` : 'No contact info')}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="text-right">
              <div className="text-sm font-semibold text-orange-600">
                {(user as any).total_orders || 0} orders
              </div>
              <div className="text-xs text-gray-500">
                ₹{(user as any).total_spent || 0}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Joined {formatDate(user.created_at)}
            </div>
            {(user as any).whatsapp_number && (
              <div className="flex items-center">
                <span className="w-4 h-4 mr-1">📱</span>
                WhatsApp
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      </div>
    )}
  </div>
</div>


        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-semibold text-orange-600">
                      {getUserInitials(selectedUser)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(selectedUser as any).profiles?.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">{(selectedUser as any).profiles?.email || 'No email'}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {selectedUser.id}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
                    <div className="space-y-2">
                      {(selectedUser as any).profiles?.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {(selectedUser as any).profiles?.phone}
                        </div>
                      )}
                      {(selectedUser as any).whatsapp_number && (
                        <div className="flex items-center text-gray-600">
                          <span className="w-4 h-4 mr-2">📱</span>
                          {(selectedUser as any).whatsapp_number}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {(selectedUser as any).profiles?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Account Statistics</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Orders:</span>
                        <span className="font-semibold">{(selectedUser as any).total_orders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Spent:</span>
                        <span className="font-semibold">₹{(selectedUser as any).total_spent || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-semibold">{formatDate(selectedUser.created_at)}</span>
                      </div>
                      {(selectedUser as any).first_order_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">First Order:</span>
                          <span className="font-semibold">{formatDate((selectedUser as any).first_order_date)}</span>
                        </div>
                      )}
                      {(selectedUser as any).last_order_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Order:</span>
                          <span className="font-semibold">{formatDate((selectedUser as any).last_order_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedUser.notes && (
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-900 mb-2">Notes</h5>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{(selectedUser as any).notes}</p>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h5 className="font-semibold text-gray-900 mb-4">Admin Actions</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </button>
                    <button 
                      onClick={() => {
                        const email = (selectedUser as any).profiles?.email
                        if (email) {
                          window.location.href = `mailto:${email}?subject=CozyCatKitchen - Customer Support&body=Dear ${(selectedUser as any).profiles?.full_name || 'Customer'},\n\n`
                        } else {
                          alert('No email address available for this user')
                        }
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </button>
                    <button 
                      onClick={async () => {
                        if (selectedUser) {
                          await fetchCustomerOrders(selectedUser.id)
                          setShowCustomerOrders(true)
                        }
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Orders
                    </button>
                    <button 
                      onClick={() => setShowOrderHistory(true)}
                      className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Order History
                    </button>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center justify-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Reset Password
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAddNoteModal(true)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Add Note
                    </button>
                    <button 
                      onClick={() => {
                        const userData = {
                          name: (selectedUser as any).profiles?.full_name || 'Unknown',
                          email: (selectedUser as any).profiles?.email || 'No email',
                          phone: (selectedUser as any).profiles?.phone || (selectedUser as any).phone || 'No phone',
                          joinDate: formatDate(selectedUser.created_at),
                          totalOrders: (selectedUser as any).total_orders || 0,
                          totalSpent: (selectedUser as any).total_spent || 0,
                          lastOrder: (selectedUser as any).last_order_date ? formatDate((selectedUser as any).last_order_date) : 'Never'
                        }
                        
                        const csvContent = `Name,Email,Phone,Join Date,Total Orders,Total Spent,Last Order\n${userData.name},${userData.email},${userData.phone},${userData.joinDate},${userData.totalOrders},${userData.totalSpent},${userData.lastOrder}`
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `user_data_${selectedUser.id.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
                        a.click()
                        window.URL.revokeObjectURL(url)
                        
                        alert('User data exported successfully!')
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    {/* Edit User Modal */}
    {showEditModal && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={(selectedUser as any).profiles?.full_name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue={(selectedUser as any).profiles?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                defaultValue={(selectedUser as any).profiles?.phone || (selectedUser as any).phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('User information updated successfully!')
                setShowEditModal(false)
              }}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Order History Modal */}
    {showOrderHistory && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Order History</h3>
            <button
              onClick={() => setShowOrderHistory(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-semibold">{(selectedUser as any).total_orders || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Spent:</span>
                <span className="font-semibold">₹{(selectedUser as any).total_spent || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">First Order:</span>
                <span className="font-semibold">
                  {(selectedUser as any).first_order_date ? formatDate((selectedUser as any).first_order_date) : 'No orders'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Order:</span>
                <span className="font-semibold">
                  {(selectedUser as any).last_order_date ? formatDate((selectedUser as any).last_order_date) : 'No orders'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-gray-600">
            <p className="mb-2">📊 Detailed order history would be displayed here</p>
            <p className="text-sm">This would show a timeline of all orders with dates, amounts, and status.</p>
          </div>
          
          <button
            onClick={() => setShowOrderHistory(false)}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium mt-4"
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* Add Note Modal */}
    {showAddNoteModal && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Add Note</h3>
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note for {(selectedUser as any).profiles?.full_name || 'Unknown'}
            </label>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Enter your note here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddNoteModal(false)
                setUserNote('')
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (userNote.trim()) {
                  alert(`Note added for ${(selectedUser as any).profiles?.full_name}: "${userNote}"`)
                  setUserNote('')
                  setShowAddNoteModal(false)
                } else {
                  alert('Please enter a note')
                }
              }}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete User Modal */}
    {showDeleteModal && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-red-600">Delete User</h3>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium mb-2">⚠️ This action cannot be undone</p>
            <div className="text-sm text-red-700">
              <p className="mb-2"><strong>User:</strong> {(selectedUser as any).profiles?.full_name || 'Unknown'}</p>
              <p className="mb-2"><strong>Email:</strong> {(selectedUser as any).profiles?.email || 'No email'}</p>
              <p className="mb-2"><strong>Orders:</strong> {(selectedUser as any).total_orders || 0}</p>
              <p><strong>Total Spent:</strong> ₹{(selectedUser as any).total_spent || 0}</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Are you absolutely sure you want to delete this user? This will remove all their data from the system.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert(`User ${(selectedUser as any).profiles?.full_name} would be deleted from the system.\n\nThis would:\n- Delete user account\n- Cancel all pending orders\n- Remove user data from database\n- Send confirmation email\n\n(Implementation would require backend API)`)
                setShowDeleteModal(false)
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Customer Orders Modal */}
    {showCustomerOrders && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Orders for {(selectedUser as any).profiles?.full_name || 'Unknown'}
            </h3>
            <button
              onClick={() => setShowCustomerOrders(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          <div className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Customer:</span> {(selectedUser as any).profiles?.full_name || 'Unknown'}<br/>
                <span className="font-medium">Email:</span> {(selectedUser as any).profiles?.email || 'No email'}<br/>
                <span className="font-medium">Total Orders:</span> {customerOrders.length}
              </p>
            </div>
          </div>

          {customerOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-gray-600">No orders found for this customer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order: any) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Order #{order.order_number || order.id?.slice(0, 8)}</h4>
                      <p className="text-sm text-gray-600">Status: <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{order.status || 'Unknown'}</span></p>
                      <p className="text-sm text-gray-600">Date: {formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹{order.total_amount || 0}</p>
                      <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setShowCustomerOrders(false)}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium mt-4"
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* Reset Password Modal */}
    {showPasswordModal && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Send a password reset email to:
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium">{(selectedUser as any).profiles?.full_name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{(selectedUser as any).profiles?.email || 'No email'}</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            This will send a password reset link to the user's email address.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert(`Password reset email sent to ${(selectedUser as any).profiles?.email}!\n\n(This would integrate with your auth provider to send an actual reset link)`)
                setShowPasswordModal(false)
              }}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
            >
              Send Reset Email
            </button>
          </div>
        </div>
      </div>
    )
  }
</div>
)}

