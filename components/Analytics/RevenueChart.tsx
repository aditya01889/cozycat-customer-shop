'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface RevenueData {
  month: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  data: RevenueData[]
  title?: string
  type?: 'line' | 'area'
}

export default function RevenueChart({ data, title = "Revenue Trend", type = 'line' }: RevenueChartProps) {
  console.log('🔍 RevenueChart received data:', data)
  console.log('🔍 RevenueChart data length:', data?.length)
  console.log('🔍 RevenueChart type:', type)
  
  // Fallback for empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">No data available</p>
          </div>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="w-full" style={{ height: '180px' }}>
          <div className="h-full flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg">
            <p className="text-center">No revenue data to display</p>
          </div>
        </div>
      </div>
    )
  }
  
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
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold text-green-600">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[0].payload.orders && (
            <p className="text-sm text-gray-600">
              Orders: <span className="font-semibold text-blue-600">{payload[0].payload.orders}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart
  const DataComponent = type === 'area' ? Area : Line

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Monthly performance overview</p>
        </div>
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">
            {data.length > 1 && data[data.length - 1].revenue > data[data.length - 2].revenue ? '+' : ''}
            {data.length > 1 ? 
              ((data[data.length - 1].revenue - data[data.length - 2].revenue) / data[data.length - 2].revenue * 100).toFixed(1) : 0
            }%
          </span>
        </div>
      </div>
      
      <div className="w-full" style={{ height: '180px' }}>
        <ResponsiveContainer width="100%" height={180}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <DataComponent
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={3}
              fill={type === 'area' ? '#f97316' : undefined}
              fillOpacity={type === 'area' ? 0.3 : undefined}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
