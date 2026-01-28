// WCAG 2.1 AA Compliance Utilities - OPTIMIZED VERSION
// Provides reusable accessibility helpers without performance impact

// Cache for announcement elements to avoid DOM thrashing
const announcementCache = new Map<string, HTMLElement>();

export const accessibilityUtils = {
  // Generate unique IDs for ARIA attributes
  generateId: (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Optimized announce function - reuses elements
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const cacheKey = `announcement-${priority}`;
    
    // Reuse existing announcement element if available
    let announcement = announcementCache.get(cacheKey);
    
    if (!announcement) {
      announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      announcementCache.set(cacheKey, announcement);
    }
    
    // Update message
    announcement.textContent = message;
    
    // Clear message after delay (don't remove element)
    setTimeout(() => {
      if (announcement) {
        announcement.textContent = '';
      }
    }, 1000);
  },

  // Optimized focus trap - debounced and minimal event listeners
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    if (focusableElements.length === 0) {
      return () => {}; // No focusable elements, no trap needed
    }
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    let isActive = true;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (!isActive || e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey, { passive: true });
    
    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      isActive = false;
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Simplified contrast check - cached results
  _contrastCache: new Map<string, number>(),
  
  checkContrast: (color1: string, color2: string): number => {
    const cacheKey = `${color1}-${color2}`;
    if (accessibilityUtils._contrastCache.has(cacheKey)) {
      return accessibilityUtils._contrastCache.get(cacheKey)!;
    }

    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(val => {
        const valNum = parseInt(val);
        return valNum <= 0.03928 
          ? valNum / 12.92 
          : Math.pow((valNum + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    accessibilityUtils._contrastCache.set(cacheKey, ratio);
    
    return ratio;
  },

  // Validate if contrast meets WCAG AA standards
  isValidContrast: (color1: string, color2: string, isLargeText: boolean = false): boolean => {
    const ratio = accessibilityUtils.checkContrast(color1, color2);
    const minimumRatio = isLargeText ? 3.0 : 4.5;
    return ratio >= minimumRatio;
  },

  // Remove focus from element and prevent tabbing to it
  disableFocus: (element: HTMLElement): void => {
    element.setAttribute('tabindex', '-1');
    element.setAttribute('aria-disabled', 'true');
  },

  // Restore focus to element
  enableFocus: (element: HTMLElement): void => {
    element.removeAttribute('tabindex');
    element.removeAttribute('aria-disabled');
  },

  // Optimized visibility check
  isVisible: (element: HTMLElement): boolean => {
    if (!element || !element.offsetParent) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  },

  // Cleanup function to prevent memory leaks
  cleanup: () => {
    announcementCache.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    announcementCache.clear();
    accessibilityUtils._contrastCache.clear();
  }
};

// Simplified focus styles - better performance
export const focusStyles = {
  base: "focus:outline-none focus:ring-2 focus:ring-offset-2",
  colors: {
    blue: "focus:ring-blue-500",
    green: "focus:ring-green-500", 
    red: "focus:ring-red-500",
    orange: "focus:ring-orange-500",
    purple: "focus:ring-purple-500"
  }
};

// Fixed ARIA labels - corrected button mappings
export const ariaLabels = {
  button: {
    close: "Close dialog",
    menu: "Toggle navigation menu",
    cart: "Shopping cart with items",
    search: "Search products",
    account: "User account menu",
    signOut: "Sign out of your account" // Fixed: was "account"
  },
  status: {
    loading: "Loading content",
    success: "Action completed successfully",
    error: "An error occurred",
    warning: "Warning message"
  }
};
