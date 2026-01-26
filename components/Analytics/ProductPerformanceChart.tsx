'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, TrendingUp, TrendingDown } from 'lucide-react'

interface ProductData {
  id: string
  name: string
  total_sold: number
  revenue: number
  growth?: number
}

interface CategoryData {
  name: string
  value: number
  percentage: number
}

interface ProductPerformanceChartProps {
  data: ProductData[]
  title?: string
  view?: 'bar' | 'pie'
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#84cc16']

export default function ProductPerformanceChart({ data, title = "Product Performance", view = 'bar' }: ProductPerformanceChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label || payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold text-green-600">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Units Sold: <span className="font-semibold text-blue-600">{payload[0].payload.total_sold}</span>
          </p>
          {payload[0].payload.growth !== undefined && (
            <p className="text-sm text-gray-600">
              Growth: <span className={`font-semibold ${payload[0].payload.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {payload[0].payload.growth >= 0 ? '+' : ''}{payload[0].payload.growth.toFixed(1)}%
              </span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold text-green-600">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Share: <span className="font-semibold text-blue-600">{payload[0].payload.percentage.toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Transform data for pie chart
  const pieData = data.map((item, index) => ({
    name: item.name,
    value: item.revenue,
    percentage: (item.revenue / data.reduce((sum, p) => sum + p.revenue, 0)) * 100,
    total_sold: item.total_sold
  }))

  if (view === 'pie') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Revenue distribution by product</p>
          </div>
          <Package className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {pieData.slice(0, 6).map((item, index) => (
            <div key={item.name} className="flex items-center text-sm">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-700 truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Top performing products</p>
        </div>
        <Package className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="#f97316"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Product List */}
      <div className="space-y-3 mt-6 pt-6 border-t border-gray-200">
        {data.slice(0, 5).map((product, index) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600 mr-3">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.total_sold} units sold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
              {product.growth !== undefined && (
                <div className={`flex items-center text-sm ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.growth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(product.growth).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
