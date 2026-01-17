import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Test endpoint that doesn't require authentication
  return NextResponse.json({
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
