'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, ArrowUpDown, BarChart3, PieChart, Activity, UserPlus } from 'lucide-react'
import Link from 'next/link'
import RevenueChart from '@/components/Analytics/RevenueChart'
import ProductPerformanceChart from '@/components/Analytics/ProductPerformanceChart'
import CustomerAnalyticsChart from '@/components/Analytics/CustomerAnalyticsChart'
import ExportButton from '@/components/Analytics/ExportButton'

interface AnalyticsData {
  revenue: { month: string; revenue: number; orders: number }[]
  productPerformance: { id: string; name: string; total_sold: number; revenue: number; growth?: number }[]
  customerGrowth: { date: string; new_customers: number; returning_customers: number; total_orders: number; revenue: number }[]
  customerSegments: { segment: string; count: number; revenue: number; percentage: number }[]
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
}

type AnalyticsCategory = 'revenue' | 'products' | 'customers' | 'orders'

export default function AdminAnalyticsContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    productPerformance: [],
    customerGrowth: [],
    customerSegments: [],
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>('revenue')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Fetching analytics data with fallback...')

      // Fallback: Use basic queries instead of RPC functions
      const [ordersResult, productsResult, profilesResult] = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount, created_at, status')
          .order('created_at', { ascending: true }),
        
        supabase
          .from('products')
          .select('*'),
        
        supabase
          .from('profiles')
          .select('*')
      ])

      if (ordersResult.error) throw ordersResult.error
      if (productsResult.error) throw productsResult.error
      if (profilesResult.error) throw profilesResult.error

      console.log('🔍 Orders data:', ordersResult.data?.length)
      console.log('🔍 Products data:', productsResult.data?.length)
      console.log('🔍 Profiles data:', profilesResult.data?.length)

      // Process revenue data - convert to expected format for charts
      const revenueByDay = ordersResult.data?.reduce((acc: any, order) => {
        const day = new Date(order.created_at).toISOString().split('T')[0]
        acc[day] = (acc[day] || 0) + order.total_amount
        return acc
      }, {}) || {}

      const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({
        month: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue as number,
        orders: 1 // We'll calculate this properly later
      }))

      // Process product performance - convert to expected format for charts
      const productData = productsResult.data?.map((product, index) => ({
        id: (product as any).id || `product-${index}`,
        name: product.name,
        total_sold: Math.floor(Math.random() * 100), // Placeholder sales
        revenue: Math.random() * 1000, // Placeholder revenue
        growth: Math.random() * 20 - 10 // Placeholder growth
      })) || []

      // Process customer data - convert to expected format for charts
      const customerData = profilesResult.data?.map((profile, index) => ({
        date: new Date().toISOString().split('T')[0], // Today's date
        new_customers: Math.random() > 0.5 ? 1 : 0, // Random new/returning
        returning_customers: Math.random() > 0.5 ? 1 : 0,
        total_orders: Math.floor(Math.random() * 20), // Placeholder orders
        revenue: Math.random() * 5000 // Placeholder revenue
      })) || []

      // Customer segments - convert to expected format
      const customerSegments = [
        { segment: 'New Customers', count: profilesResult.data?.filter(p => p.role === 'customer').length || 0, revenue: 2500, percentage: 35 },
        { segment: 'Returning Customers', count: Math.floor(Math.random() * 50), revenue: 5000, percentage: 45 },
        { segment: 'VIP Customers', count: Math.floor(Math.random() * 20), revenue: 3000, percentage: 15 },
        { segment: 'Inactive', count: Math.floor(Math.random() * 10), revenue: 0, percentage: 5 }
      ]

      const analyticsData = {
        revenue: revenueData,
        productPerformance: productData,
        customerGrowth: customerData,
        customerSegments: customerSegments,
        totalRevenue: ordersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalProducts: productsResult.data?.length || 0,
        totalCustomers: profilesResult.data?.length || 0
      }

      console.log('🔍 Processed analytics data:', analyticsData)
      console.log('🔍 Revenue data sample:', revenueData.slice(0, 2))
      console.log('🔍 Product data sample:', productData.slice(0, 2))
      console.log('🔍 Customer data sample:', customerData.slice(0, 2))
      console.log('🔍 Customer segments sample:', customerSegments.slice(0, 2))
      setAnalyticsData(analyticsData)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      // Set empty data on error to prevent crashes
      setAnalyticsData({
        revenue: [],
        productPerformance: [],
        customerGrowth: [],
        customerSegments: [],
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics from analytics data
  const totalRevenue = analyticsData?.totalRevenue || 0
  const totalOrders = analyticsData?.totalOrders || 0
  const totalProducts = analyticsData?.totalProducts || 0
  const totalCustomers = analyticsData?.totalCustomers || 0

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analytics Error</h2>
          <p className="text-gray-600">Failed to load analytics data</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500">Business insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
              <ExportButton 
                data={[
                  ...analyticsData.revenue.map(item => ({
                    Month: item.month,
                    Revenue: item.revenue,
                    Orders: item.orders,
                    Type: 'Revenue'
                  })),
                  ...analyticsData.productPerformance.map(item => ({
                    Product: item.name,
                    Revenue: item.revenue,
                    'Total Sold': item.total_sold,
                    Growth: item.growth,
                    Type: 'Product'
                  })),
                  ...analyticsData.customerSegments.map(item => ({
                    'Customer Segment': item.segment,
                    Count: item.count,
                    Revenue: item.revenue,
                    'Percentage': item.percentage,
                    Type: 'Customer Segment'
                  }))
                ]} 
                filename="analytics-report" 
                title="Analytics Report" 
              />
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveCategory('revenue')}
              className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'revenue'
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue Analytics
            </button>
            <button
              onClick={() => setActiveCategory('products')}
              className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'products'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Product Analytics
            </button>
            <button
              onClick={() => setActiveCategory('customers')}
              className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'customers'
                  ? 'bg-green-100 text-green-700 border-2 border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Customer Analytics
            </button>
            <button
              onClick={() => setActiveCategory('orders')}
              className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'orders'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Analytics
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                <div className={`flex items-center mt-2 text-sm text-green-600`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5%
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalOrders)}</p>
                <div className={`flex items-center mt-2 text-sm text-green-600`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2%
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalCustomers)}</p>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  Active customers
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalProducts)}</p>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-1" />
                  Active products
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Content Based on Category */}
        {activeCategory === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +12.5%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalOrders)}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +8.2%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.totalOrders > 0 ? formatCurrency(analyticsData.totalRevenue / analyticsData.totalOrders) : formatCurrency(0)}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +5.3%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <RevenueChart data={analyticsData.revenue} />
            </div>
          </div>
        )}

        {activeCategory === 'products' && (
          <div className="space-y-6">
            {/* Product Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalProducts)}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      Active products
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Product</p>
                    <p className="text-xl font-bold text-gray-900">
                      {analyticsData.productPerformance[0]?.name || 'N/A'}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4 mr-1" />
                      Best performer
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Product Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analyticsData.productPerformance.reduce((sum, p) => sum + p.revenue, 0))}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +15.2%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Performance Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ProductPerformanceChart data={analyticsData.productPerformance.slice(0, 10)} />
            </div>
          </div>
        )}

        {activeCategory === 'customers' && (
          <div className="space-y-6">
            {/* Customer Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalCustomers)}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +18.7%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.customerGrowth.reduce((sum, c) => sum + c.new_customers, 0)}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <UserPlus className="h-4 w-4 mr-1" />
                      +24 this month
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Orders/Customer</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.totalCustomers > 0 ? (analyticsData.totalOrders / analyticsData.totalCustomers).toFixed(1) : '0.0'}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +2.3
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <CustomerAnalyticsChart 
                  data={analyticsData.customerGrowth} 
                  segments={analyticsData.customerSegments}
                  showOnlyGrowth={true}
                />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <CustomerAnalyticsChart 
                  data={analyticsData.customerGrowth} 
                  segments={analyticsData.customerSegments}
                  showOnlySegments={true}
                />
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'orders' && (
          <div className="space-y-6">
            {/* Order Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalOrders)}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +8.2%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <Package className="h-4 w-4 mr-1" />
                      75% success
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <div className="flex items-center mt-2 text-sm text-yellow-600">
                      <Activity className="h-4 w-4 mr-1" />
                      12.5% pending
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <div className="flex items-center mt-2 text-sm text-blue-600">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      12.5% processing
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Delivered</h4>
                  <p className="text-3xl font-bold text-green-600 mb-2">18</p>
                  <p className="text-sm text-gray-600">75% of total orders</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Pending</h4>
                  <p className="text-3xl font-bold text-yellow-600 mb-2">3</p>
                  <p className="text-sm text-gray-600">12.5% of total orders</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing</h4>
                  <p className="text-3xl font-bold text-blue-600 mb-2">3</p>
                  <p className="text-sm text-gray-600">12.5% of total orders</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
