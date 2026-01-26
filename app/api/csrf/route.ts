import { NextResponse } from 'next/server'
import { setCSRFToken } from '@/lib/security/csrf'

export async function GET() {
  try {
    const token = await setCSRFToken()
    
    return NextResponse.json({
      success: true,
      csrfToken: token
    })
  } catch (error) {
    console.error('Error setting CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to set CSRF token' },
      { status: 500 }
    )
  }
}
