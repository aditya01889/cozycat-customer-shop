'use client'

import React from 'react'

// Skip link component for keyboard navigation
export const SkipLinks: React.FC = () => {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-64 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to navigation
      </a>
    </>
  )
}

// Screen reader only text utility
interface ScreenReaderOnlyProps {
  children: React.ReactNode
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Focus trap hook for modals and dropdowns
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // Focus first element when trap is activated
    if (firstElement) {
      firstElement.focus()
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

// Screen reader announcement hook
export const useScreenReaderAnnouncement = () => {
  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  return { announce }
}
