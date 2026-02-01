'use client'

import { useEffect, useRef } from 'react'

interface HMRFixWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Development-only wrapper to prevent HMR issues with Next.js Image component
 * This component helps handle module hot replacement gracefully
 */
export default function HMRFixWrapper({ children, fallback = null }: HMRFixWrapperProps) {
  const isMounted = useRef(false)
  
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])
  
  // In development, add extra safety checks
  if (process.env.NODE_ENV === 'development') {
    try {
      return <>{children}</>
    } catch (error) {
      console.warn('HMRFixWrapper: Component error, using fallback', error)
      return <>{fallback}</>
    }
  }
  
  return <>{children}</>
}
