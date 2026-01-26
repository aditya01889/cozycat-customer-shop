/**
 * Authentication Fixes for Phase 1.3
 * RLS Policies, Session Management, and Security Improvements
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '../env-validation'

// Enhanced auth client with better timeout handling
export function createEnhancedAuthClient() {
  const { url, anonKey } = getSupabaseConfig()
  
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
}

// Enhanced server auth client with timeout and better error handling
export function createEnhancedServerClient() {
  const { url, serviceRoleKey } = getSupabaseConfig()
  
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for server client')
  }
  
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
}

// Session timeout configuration
export const SESSION_CONFIG = {
  DEFAULT_SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  TEST_SESSION_TIMEOUT: 30 * 1000, // 30 seconds for testing
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
}

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
}

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Enhanced password validation
export function validatePasswordStrength(password: string) {
  const errors = []
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`)
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+=\[\]{}|\\:";'<>,.?/~`]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  if (PASSWORD_REQUIREMENTS.preventCommonPasswords) {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'user', 'test', 'qwerty', 'abc123'
    ]
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  }
}

// Calculate password strength score
function calculatePasswordStrength(password: string): number {
  let score = 0
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*()_+=\[\]{}|\\:";'<>,.?/~`]/.test(password)) score += 1
  
  return Math.min(score, 5)
}

// Enhanced email validation
export function validateEmail(email: string) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' }
  }
  
  return { isValid: true }
}

// Session management utilities
export const sessionUtils = {
  // Check if session is expired
  isSessionExpired: (lastSignIn: number) => {
    const now = Date.now()
    return (now - lastSignIn) > SESSION_CONFIG.DEFAULT_SESSION_TIMEOUT
  },
  
  // Get session refresh threshold
  shouldRefreshSession: (lastRefresh: number) => {
    const now = Date.now()
    return (now - lastRefresh) > SESSION_CONFIG.REFRESH_THRESHOLD
  }
}
