/**
 * Input validation schemas using Zod
 * Provides type-safe validation for all user inputs
 */

import { z } from 'zod'

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/
const nameRegex = /^[a-zA-Z\s\-']{2,50}$/
const addressRegex = /^[a-zA-Z0-9\s\-\,\.\#\/]{5,200}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// =============================================================================
// Authentication Schemas
// =============================================================================

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
})

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
})

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
})

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(128, 'Password is too long'),
  
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
})

// =============================================================================
// Customer Profile Schemas
// =============================================================================

export const customerProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .nullable(),
  
  email: z
    .string()
    .max(255, 'Email is too long')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email address')
    .transform((val) => val?.toLowerCase().trim())
    .optional()
    .nullable(),
})

// =============================================================================
// Address Schemas
// =============================================================================

export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  
  address_line1: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address is too long')
    .regex(addressRegex, 'Invalid address format')
    .trim(),
  
  address_line2: z
    .string()
    .max(200, 'Address line 2 is too long')
    .regex(addressRegex, 'Invalid address format')
    .trim()
    .optional()
    .nullable(),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City name is too long')
    .regex(/^[a-zA-Z\s\-']{2,50}$/, 'Invalid city name')
    .trim(),
  
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State name is too long')
    .regex(/^[a-zA-Z\s\-']{2,50}$/, 'Invalid state name')
    .trim(),
  
  postal_code: z
    .string()
    .min(6, 'Postal code must be at least 6 characters')
    .max(10, 'Postal code is too long')
    .regex(/^[A-Za-z0-9\s\-]{6,10}$/, 'Invalid postal code format')
    .trim(),
  
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country name is too long')
    .regex(/^[a-zA-Z\s\-']{2,50}$/, 'Invalid country name')
    .trim(),
  
  is_default: z.boolean().default(false),
  
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional().nullable(),
})

// =============================================================================
// Product Schemas
// =============================================================================

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  sort_by: z.enum(['name', 'price_asc', 'price_desc', 'created_at']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

// =============================================================================
// Order Schemas
// =============================================================================

export const orderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  variant_id: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  customer_address_id: z.string().uuid('Invalid address ID').optional(),
  delivery_notes: z.string().max(500, 'Delivery notes are too long').optional().nullable(),
  payment_method: z.enum(['razorpay', 'cod']),
})

// =============================================================================
// Contact Form Schema
// =============================================================================

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
  
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject is too long')
    .trim(),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long')
    .trim(),
})

// =============================================================================
// Admin Schemas
// =============================================================================

export const adminUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
  
  role: z.enum(['admin', 'operations', 'partner', 'customer']),
  
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .nullable(),
})

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name is too long')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long')
    .trim(),
  
  category_id: z.string().uuid('Invalid category ID'),
  
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    weight: z.string().min(1, 'Weight is required'),
    price: z.number().min(0, 'Price must be positive'),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
  })).min(1, 'Product must have at least one variant'),
})

// =============================================================================
// Type Exports
// =============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type AdminUserInput = z.infer<typeof adminUserSchema>
export type ProductInput = z.infer<typeof productSchema>

// =============================================================================
// Validation Helper Functions
// =============================================================================

/**
 * Validate input against a schema and return the result
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  error: string
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err: any) => err.message).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Validation failed' }
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential JavaScript URLs
    .replace(/on\w+=/gi, '') // Remove potential event handlers
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): string | null {
  const sanitized = sanitizeString(email.toLowerCase().trim())
  return emailRegex.test(sanitized) ? sanitized : null
}

/**
 * Validate and sanitize phone number
 */
export function validatePhone(phone: string): string | null {
  const sanitized = phone.replace(/[^\d+\-\s\(\)]/g, '')
  return phoneRegex.test(sanitized) ? sanitized : null
}
