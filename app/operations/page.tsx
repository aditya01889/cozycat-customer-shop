'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ChevronRight,
  LogOut,
  Factory,
  Truck,
  Package as InventoryIcon,
  Users2,
  ChefHat
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  inProductionOrders: number
  readyOrders: number
  totalRevenue: number
  lowStockIngredients: number
  activeVendors: number
  pendingDeliveries: number
  inTransitDeliveries: number
  activeDeliveryPartners: number
}

export default function OperationsDashboard() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inProductionOrders: 0,
    readyOrders: 0,
    totalRevenue: 0,
    lowStockIngredients: 0,
    activeVendors: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    activeDeliveryPartners: 0
  })
  const [loading, setLoading] = useState(true)
  const [operationsUser, setOperationsUser] = useState<any>(null)

  useEffect(() => {
    checkOperationsAccess()
    fetchDashboardStats()
  }, [])

  const checkOperationsAccess = async () => {
    const opsUser = await getOperationsUserClient()
    if (!opsUser) {
      window.location.href = '/'
      return
    }
    setOperationsUser(opsUser)
  }

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching operations dashboard stats...')
      
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch orders by status
      const { data: orders } = await supabase
        .from('orders')
        .select('status, total_amount')
        .neq('status', 'cancelled')

      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const inProductionOrders = orders?.filter(o => o.status === 'in_production').length || 0
      
      const revenue = orders?.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount) || 0
        return sum + amount
      }, 0) || 0

      // Fetch low stock ingredients (below 50% of reorder level)
      const { data: allIngredients } = await supabase
        .from('ingredients')
        .select('current_stock, reorder_level')

      // Filter in JavaScript for ingredients below 50% of reorder level
      const lowStockIngredients = allIngredients?.filter(ingredient => 
        ingredient.current_stock < (ingredient.reorder_level * 0.5)
      ).length || 0

      // Fetch active vendors
      const { count: vendorsCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch delivery stats
      const { data: deliveries } = await supabase
        .from('deliveries')
        .select('delivery_status')

      const pendingDeliveries = deliveries?.filter(d => d.delivery_status === 'pending').length || 0
      const inTransitDeliveries = deliveries?.filter(d => d.delivery_status === 'in_transit').length || 0
      const readyOrders = deliveries?.filter(d => d.delivery_status === 'scheduled').length || 0

      // Fetch active delivery partners
      const { count: deliveryPartnersCount } = await supabase
        .from('delivery_partners')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: orders?.length || 0,
        pendingOrders,
        inProductionOrders,
        readyOrders,
        totalRevenue: revenue,
        lowStockIngredients,
        activeVendors: vendorsCount || 0,
        pendingDeliveries,
        inTransitDeliveries,
        activeDeliveryPartners: deliveryPartnersCount || 0
      })
    } catch (error) {
      console.error('Error fetching operations dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading operations dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏭</span>
              <h1 className="text-xl font-bold text-gray-900">CozyCat Operations</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {operationsUser?.full_name || 'Operations Staff'}
              </span>
              <button 
                onClick={signOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Operations Dashboard</h2>
          <p className="text-gray-600">Manage production, inventory, and orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Production</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProductionOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Factory className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ready for Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{stats.readyOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockIngredients}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <InventoryIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Factory className="w-5 h-5 text-purple-600 mr-2" />
              Production Management
            </h3>
            <div className="space-y-3">
              <Link
                href="/operations/recipes"
                className="flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
              >
                <div className="flex items-center">
                  <ChefHat className="w-5 h-5 text-orange-600 mr-3" />
                  <span className="font-medium text-gray-900">Recipe Management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
              </Link>

              <Link
                href="/operations/production-queue"
                className="flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">Production Queue</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </Link>

              <Link
                href="/operations/batches"
                className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-900">Manage Batches</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 text-green-600 mr-2" />
              Delivery Management
            </h3>
            <div className="space-y-3">
              <Link
                href="/operations/deliveries"
                className="flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">Manage Deliveries</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </Link>

              <Link
                href="/operations/delivery-partners"
                className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Users2 className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-gray-900">Delivery Partners</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InventoryIcon className="w-5 h-5 text-blue-600 mr-2" />
              Inventory & Vendors
            </h3>
            <div className="space-y-3">
              <Link
                href="/operations/inventory"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center">
                  <InventoryIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Inventory Management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/operations/vendors"
                className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Users2 className="w-5 h-5 text-cyan-600 mr-3" />
                  <span className="font-medium text-gray-900">Vendor Management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats.pendingOrders > 0 || stats.lowStockIngredients > 0) && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Action Required</h3>
            <div className="space-y-3">
              {stats.pendingOrders > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <p className="font-medium text-orange-900">{stats.pendingOrders} Orders Pending Confirmation</p>
                      <p className="text-sm text-orange-700">Review and confirm orders to start production</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.lowStockIngredients > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <InventoryIcon className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="font-medium text-red-900">{stats.lowStockIngredients} Ingredients Low in Stock</p>
                      <p className="text-sm text-red-700">Place vendor orders to avoid production delays</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
