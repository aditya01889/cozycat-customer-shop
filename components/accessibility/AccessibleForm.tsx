'use client'

import React from 'react'
import { accessibilityUtils, focusStyles } from '@/lib/utils/accessibility'

interface AccessibleFormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactElement
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  error,
  required = false,
  description,
  children
}) => {
  const fieldId = React.useId()
  const errorId = `${fieldId}-error`
  const descriptionId = `${fieldId}-description`

  const clonedChild = React.cloneElement(children as React.ReactElement<any>, {
    id: fieldId,
    'aria-describedby': [
      description ? descriptionId : null,
      error ? errorId : null
    ].filter(Boolean).join(' '),
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required,
    className: `${(children as any).props.className || ''} ${focusStyles.base} ${focusStyles.colors.blue}`
  })

  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      
      {clonedChild}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  children: React.ReactNode
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    danger: 'border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-describedby={loading ? 'loading-description' : undefined}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
      {loading && (
        <span id="loading-description" className="sr-only">
          Loading, please wait
        </span>
      )}
    </button>
  )
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
  description?: string
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  required = false,
  description,
  className = '',
  ...props
}) => {
  if (!label) {
    return (
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    )
  }

  return (
    <AccessibleFormField
      label={label}
      error={error}
      required={required}
      description={description}
    >
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${className}`}
        {...props}
      />
    </AccessibleFormField>
  )
}

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  required?: boolean
  description?: string
  options: { value: string; label: string }[]
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  label,
  error,
  required = false,
  description,
  options,
  className = '',
  ...props
}) => {
  if (!label) {
    return (
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <AccessibleFormField
      label={label}
      error={error}
      required={required}
      description={description}
    >
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </AccessibleFormField>
  )
}
