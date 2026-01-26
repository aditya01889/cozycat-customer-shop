/**
 * Client-side CSRF utilities
 * For getting CSRF tokens in browser components
 */

/**
 * Get CSRF token from cookies for client-side requests
 */
export function getCSRFToken(): string | null {
  // Get all cookies
  const cookies = document.cookie.split(';')
  
  // Look for the client-accessible CSRF token cookie
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token_client') {
      return decodeURIComponent(value)
    }
  }
  
  // Debug: Log all cookies to see what's available
  console.log('🔍 Available cookies:', document.cookie)
  console.log('🔍 CSRF client cookie not found')
  
  return null
}

/**
 * Get CSRF token for API requests
 * Returns the token or null if not available
 */
export function getCSRFHeader(): { 'x-csrf-token': string } | Record<string, never> {
  const token = getCSRFToken()
  return token ? { 'x-csrf-token': token } : {}
}
