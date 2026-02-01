'use client'

import { useState } from 'react'

interface SimpleImageProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  width?: number
  height?: number
  style?: React.CSSProperties
}

/**
 * Simple image component that gracefully handles configuration errors
 * Uses regular img tag with fallback for development
 */
export default function SimpleImage({
  src,
  alt,
  className = '',
  fallback,
  width,
  height,
  style,
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}
