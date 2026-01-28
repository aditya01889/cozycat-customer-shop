/**
 * CSRF Protection utilities
 * Prevents Cross-Site Request Forgery attacks
 */

import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Define RequestInit interface for compatibility
interface RequestInit {
  method?: string;
  headers?: HeadersInit | Record<string, string>;
  body?: BodyInit | null;
  mode?: 'navigate' | 'same-origin' | 'no-cors' | 'cors';
  credentials?: 'include' | 'same-origin' | 'omit';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  redirect?: 'manual' | 'follow' | 'error';
  referrer?: string;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal | null;
  window?: null;
}

/**
 * Generate a random CSRF token
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Set CSRF token in both HTTP-only and accessible cookies
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()
  const isCiDummy = process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true'
  
  // Set HTTP-only cookie for server-side validation
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isCiDummy,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  // Set accessible cookie for client-side access
  cookieStore.set(`${CSRF_TOKEN_NAME}_client`, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production' && !isCiDummy,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  return token
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  // Skip CSRF validation for GET requests (they should be safe)
  if (request.method === 'GET') {
    return true
  }
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  // Get token from cookie
  const cookieToken = await getCSRFToken()
  
  if (!headerToken || !cookieToken) {
    return false
  }
  
  // Compare tokens with constant-time comparison to prevent timing attacks
  return timingSafeEqual(headerToken, cookieToken)
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Middleware to validate CSRF token for API routes
 */
export function requireCSRFProtection(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    // Validate CSRF token
    const isValid = await validateCSRFToken(req)
    
    if (!isValid) {
      return new Response(
        JSON.stringify({
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    
    // Proceed with the original handler
    return handler(req)
  }
}

/**
 * Get CSRF token for client-side usage
 */
export async function getCSRFTokenForClient(): Promise<{ token: string; headerName: string }> {
  const token = await getCSRFToken()
  
  if (!token) {
    // Generate new token if none exists
    const newToken = await setCSRFToken()
    return {
      token: newToken,
      headerName: CSRF_HEADER_NAME,
    }
  }
  
  return {
    token,
    headerName: CSRF_HEADER_NAME,
  }
}

/**
 * Client-side utility to include CSRF token in requests
 */
export class CSRFProtectedRequest {
  private token: string
  private headerName: string
  
  constructor(token: string, headerName: string = CSRF_HEADER_NAME) {
    this.token = token
    this.headerName = headerName
  }
  
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers)
    headers.set(this.headerName, this.token)
    
    return fetch(url, {
      ...options,
      headers,
    })
  }
  
  async post(url: string, data: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    })
  }
  
  async put(url: string, data: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    })
  }
  
  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'DELETE',
    })
  }
}
