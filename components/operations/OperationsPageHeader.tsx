'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

interface OperationsPageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
  children?: React.ReactNode
  actions?: React.ReactNode
}

export default function OperationsPageHeader({
  title,
  description,
  icon,
  showBackButton = true,
  backHref = '/operations',
  backLabel = 'Back to Dashboard',
  children,
  actions
}: OperationsPageHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        {showBackButton && (
          <div className="pt-4 pb-2">
            <Link
              href={backHref}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Link>
          </div>
        )}
        
        {/* Page Title */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
        
        {/* Additional Header Content */}
        {children && (
          <div className="pb-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
