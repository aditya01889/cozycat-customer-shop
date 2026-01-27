'use client'

import { useState, useEffect } from 'react'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface MobileChartProps {
  data: ChartData[]
  title?: string
  type?: 'bar' | 'line' | 'pie'
  height?: number
}

export default function MobileChart({ 
  data, 
  title = "Chart", 
  type = 'bar', 
  height = 200 
}: MobileChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const maxValue = Math.max(...data.map(d => d.value), 1)

  if (type === 'bar') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            {data.length} items
          </div>
        </div>
        
        <div style={{ height: `${height}px` }} className="relative overflow-x-auto">
          <div className="flex items-end h-full min-w-max px-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-end mx-1"
                style={{ 
                  height: '100%',
                  minWidth: '60px',
                  maxWidth: '80px'
                }}
              >
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm transition-all duration-300 hover:from-orange-600 hover:to-orange-500"
                  style={{
                    height: `${(item.value / maxValue) * (height - 60)}px`,
                    minHeight: '4px',
                    backgroundColor: item.color || '#f97316'
                  }}
                />
                <div className="text-xs text-gray-600 mt-2 text-center px-1 truncate w-full">
                  {item.label}
                </div>
                <div className="text-xs font-semibold text-gray-900">
                  {item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'line') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            {data.length} points
          </div>
        </div>
        
        <div style={{ height: `${height}px` }} className="relative">
          {/* SVG Line Chart */}
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 400 ${height}`}
            className="w-full h-full"
          >
            {/* Grid Lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={height - (i * (height / 5))}
                x2="400"
                y2={height - (i * (height / 5))}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Line Path */}
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 400
                const y = height - (item.value / maxValue) * (height - 40)
                return `${x},${y}`
              }).join(' ')}
            />
            
            {/* Data Points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400
              const y = height - (item.value / maxValue) * (height - 40)
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#f97316"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#374151"
                    className="hidden sm:block"
                  >
                    {item.value}
                  </text>
                  <text
                    x={x}
                    y={height + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {item.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#84cc16']
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            {data.length} segments
          </div>
        </div>
        
        <div style={{ height: `${height}px` }} className="relative">
          <div className="flex items-center justify-center h-full">
            {/* Simple Pie Chart using SVG */}
            <svg width="160" height="160" viewBox="0 0 160 160" className="w-40 h-40">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const angle = (item.value / total) * 360
                const startAngle = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0)
                const endAngle = startAngle + angle
                
                // Convert to radians
                const startRad = (startAngle - 90) * Math.PI / 180
                const endRad = (endAngle - 90) * Math.PI / 180
                
                // Calculate path
                const x1 = 80 + 70 * Math.cos(startRad)
                const y1 = 80 + 70 * Math.sin(startRad)
                const x2 = 80 + 70 * Math.cos(endRad)
                const y2 = 80 + 70 * Math.sin(endRad)
                
                const largeArcFlag = angle > 180 ? 1 : 0
                
                return (
                  <g key={index}>
                    <path
                      d={`M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={colors[index % colors.length]}
                      stroke="white"
                      strokeWidth="2"
                    />
                    {percentage > 5 && (
                      <text
                        x={80 + 40 * Math.cos((startRad + endRad) / 2)}
                        y={80 + 40 * Math.sin((startRad + endRad) / 2)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill="white"
                        fontWeight="bold"
                      >
                        {percentage.toFixed(0)}%
                      </text>
                    )}
                  </g>
                )
              })}
              {/* Center circle for donut effect */}
              <circle cx="80" cy="80" r="35" fill="white" />
              <text
                x="80"
                y="80"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fill="#374151"
                fontWeight="bold"
              >
                {data.length}
              </text>
              <text
                x="80"
                y="95"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#6b7280"
              >
                segments
              </text>
            </svg>
          </div>
        </div>
        
        {/* Enhanced Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-gray-900">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-gray-500 bg-white px-2 py-1 rounded">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center text-gray-500 p-8 border border-gray-200 rounded-lg">
        <p>Unsupported chart type: {type}</p>
      </div>
    </div>
  )
}
