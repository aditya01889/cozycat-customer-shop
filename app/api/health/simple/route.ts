import { NextResponse } from 'next/server'

/**
 * Simple health check endpoint for load balancers and monitoring systems
 * Returns minimal information with fast response time
 */
export async function GET() {
  try {
    // Basic application health check
    const uptime = process.uptime()
    const memory = process.memoryUsage()
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024), // MB
        total: Math.round(memory.heapTotal / 1024 / 1024) // MB
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 })
  }
}
