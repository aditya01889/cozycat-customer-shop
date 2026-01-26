'use client'

import { ReactNode } from 'react'

interface LazyLoadingProps {
  children?: ReactNode
  message?: string
}

export default function LazyLoading({ children, message = 'Loading...' }: LazyLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
        {children}
      </div>
    </div>
  )
}
