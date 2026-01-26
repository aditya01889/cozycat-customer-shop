'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Users, UserPlus, TrendingUp, Repeat } from 'lucide-react'

interface CustomerData {
  date: string
  new_customers: number
  returning_customers: number
  total_orders: number
  revenue: number
}

interface SegmentData {
  segment: string
  count: number
  revenue: number
  percentage: number
}

interface CustomerAnalyticsChartProps {
  data: CustomerData[]
  segments: SegmentData[]
  title?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function CustomerAnalyticsChart({ data, segments, title = "Customer Analytics" }: CustomerAnalyticsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomerTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            New Customers: <span className="font-semibold text-blue-600">{payload[0].payload.new_customers}</span>
          </p>
          <p className="text-sm text-gray-600">
            Returning: <span className="font-semibold text-green-600">{payload[0].payload.returning_customers}</span>
          </p>
          <p className="text-sm text-gray-600">
            Orders: <span className="font-semibold text-purple-600">{payload[0].payload.total_orders}</span>
          </p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold text-orange-600">{formatCurrency(payload[0].payload.revenue)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const SegmentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.segment}</p>
          <p className="text-sm text-gray-600">
            Customers: <span className="font-semibold text-blue-600">{payload[0].payload.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold text-green-600">{formatCurrency(payload[0].payload.revenue)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Share: <span className="font-semibold text-purple-600">{payload[0].payload.percentage.toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const totalCustomers = data.reduce((sum, item) => sum + item.new_customers + item.returning_customers, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const avgOrdersPerCustomer = totalCustomers > 0 ? data.reduce((sum, item) => sum + item.total_orders, 0) / totalCustomers : 0

  return (
    <div className="space-y-8">
      {/* Customer Growth Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Growth Trends</h3>
            <p className="text-sm text-gray-500">New vs returning customers over time</p>
          </div>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="h-80 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomerTooltip />} />
                <Line
                  type="monotone"
                  dataKey="new_customers"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="New Customers"
                />
                <Line
                  type="monotone"
                  dataKey="returning_customers"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Returning Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p className="text-center">No customer data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Segments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
              <p className="text-sm text-gray-500">Distribution by customer type</p>
            </div>
            <UserPlus className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="h-64 w-full">
            {segments.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <PieChart margin={{ top: 20, right: 120, left: 120, bottom: 20 }}>
                  <Pie
                    data={segments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, segment }: any) => {
                      const RADIAN = Math.PI / 180
                      const radius = outerRadius + 30 // Move labels further away from the chart
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)
                      
                      if (segment === 'Inactive') {
                        // Position 'Inactive' label on the left side, further away
                        return (
                          <text 
                            x={cx - 100} 
                            y={y} 
                            fill="#1f2937" // Darker color for better readability
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            fontSize="13"
                            fontWeight="500"
                          >
                            {`${segment}: ${(percent * 100).toFixed(1)}%`}
                          </text>
                        )
                      } else if (index < 2) {
                        // Keep other labels on the right, further away
                        return (
                          <text 
                            x={cx + 100} 
                            y={y} 
                            fill="#1f2937" // Darker color for better readability
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            fontSize="13"
                            fontWeight="500"
                          >
                            {`${segment}: ${(percent * 100).toFixed(1)}%`}
                          </text>
                        )
                      }
                      return null
                    }}
                  >
                    {segments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<SegmentTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-center">No segment data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
              <p className="text-sm text-gray-500">Customer performance indicators</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center">
                <Repeat className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Orders/Customer</p>
                  <p className="text-xl font-bold text-gray-900">{avgOrdersPerCustomer.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Customer Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue / Math.max(totalCustomers, 1))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
