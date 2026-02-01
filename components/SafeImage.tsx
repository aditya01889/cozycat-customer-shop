'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  fallback?: React.ReactNode
  width?: number
  height?: number
  style?: React.CSSProperties
}

/**
 * Safe Image component that handles Next.js Image configuration errors gracefully
 * Falls back to regular img tag if Next.js Image fails
 */
export default function SafeImage({
  src,
  alt,
  fill = false,
  className = '',
  sizes,
  priority = false,
  fallback,
  width,
  height,
  style,
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    setImageError(true)
    if (fallback) {
      setUseFallback(true)
    }
  }

  // If we've already determined to use fallback, show it
  if (useFallback || imageError) {
    return <>{fallback}</>
  }

  // Try Next.js Image first
  try {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          onError={handleError}
          unoptimized
        />
      )
    } else {
      return (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 300}
          className={className}
          sizes={sizes}
          priority={priority}
          onError={handleError}
          unoptimized
          style={style}
        />
      )
    }
  } catch (error) {
    // If Next.js Image fails, fall back to regular img tag
    console.warn('SafeImage: Next.js Image failed, using fallback', error)
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ ...style, position: 'absolute', width: '100%', height: '100%' }}
          onError={handleError}
        />
      )
    } else {
      return (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={style}
          onError={handleError}
        />
      )
    }
  }
}
