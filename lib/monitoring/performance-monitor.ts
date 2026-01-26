// Performance monitoring and error tracking

import { useState, useCallback } from 'react'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

export interface ErrorMetric {
  message: string
  stack?: string
  timestamp: Date
  context?: Record<string, any>
  userId?: string
  route?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface PerformanceReport {
  metrics: PerformanceMetric[]
  errors: ErrorMetric[]
  summary: {
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    slowestRequest: number
    fastestRequest: number
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorMetric[] = []
  private requestTimes: number[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics
  private maxErrors = 500 // Keep last 500 errors

  // Record a performance metric
  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    }

    this.metrics.push(metric)
    this.requestTimes.push(value)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    if (this.requestTimes.length > this.maxMetrics) {
      this.requestTimes = this.requestTimes.slice(-this.maxMetrics)
    }

    console.log(`📊 Performance: ${name} = ${value}${unit}`)
  }

  // Record an error
  recordError(message: string, context?: Record<string, any>, severity: ErrorMetric['severity'] = 'medium') {
    const error: ErrorMetric = {
      message,
      stack: new Error().stack,
      timestamp: new Date(),
      context,
      severity
    }

    this.errors.push(error)

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    console.error(`🚨 Error [${severity}]: ${message}`, context)
  }

  // Get performance report
  getReport(): PerformanceReport {
    const totalRequests = this.requestTimes.length
    const averageResponseTime = totalRequests > 0 
      ? this.requestTimes.reduce((sum, time) => sum + time, 0) / totalRequests 
      : 0
    const errorRate = totalRequests > 0 ? (this.errors.length / totalRequests) * 100 : 0
    const slowestRequest = totalRequests > 0 ? Math.max(...this.requestTimes) : 0
    const fastestRequest = totalRequests > 0 ? Math.min(...this.requestTimes) : 0

    return {
      metrics: this.metrics,
      errors: this.errors,
      summary: {
        totalRequests,
        averageResponseTime,
        errorRate,
        slowestRequest,
        fastestRequest
      }
    }
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  // Get recent metrics
  getRecentMetrics(minutes: number = 5): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.metrics.filter(metric => metric.timestamp > cutoff)
  }

  // Get recent errors
  getRecentErrors(minutes: number = 5): ErrorMetric[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.errors.filter(error => error.timestamp > cutoff)
  }

  // Clear all data
  clear() {
    this.metrics = []
    this.errors = []
    this.requestTimes = []
    console.log('🧹 Performance monitor cleared')
  }

  // Get performance alerts
  getAlerts(): string[] {
    const alerts: string[] = []
    const report = this.getReport()

    // Response time alerts
    if (report.summary.averageResponseTime > 2000) {
      alerts.push(`⚠️ High average response time: ${report.summary.averageResponseTime.toFixed(0)}ms`)
    }

    if (report.summary.slowestRequest > 5000) {
      alerts.push(`🚨 Very slow request detected: ${report.summary.slowestRequest.toFixed(0)}ms`)
    }

    // Error rate alerts
    if (report.summary.errorRate > 5) {
      alerts.push(`🚨 High error rate: ${report.summary.errorRate.toFixed(1)}%`)
    }

    // Recent errors
    const recentErrors = this.getRecentErrors(5)
    if (recentErrors.length > 10) {
      alerts.push(`⚠️ High error frequency: ${recentErrors.length} errors in last 5 minutes`)
    }

    // Critical errors
    const criticalErrors = this.errors.filter(error => error.severity === 'critical')
    if (criticalErrors.length > 0) {
      alerts.push(`🚨 ${criticalErrors.length} critical errors detected`)
    }

    return alerts
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Performance monitoring middleware
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    
    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime
      
      performanceMonitor.recordMetric(name, duration, 'ms', {
        success: 'true'
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      performanceMonitor.recordMetric(name, duration, 'ms', {
        success: 'false'
      })
      
      performanceMonitor.recordError(
        error instanceof Error ? error.message : 'Unknown error',
        {
          function: name,
          args: args.length,
          duration
        },
        'high'
      )
      
      throw error
    }
  }
}

// API performance monitoring wrapper
export function monitorApiCall(
  apiFunction: () => Promise<any>,
  apiName: string,
  params?: Record<string, any>
) {
  return withPerformanceMonitoring(apiFunction, `api_${apiName}`)()
}

// Database query monitoring
export function monitorDatabaseQuery<T>(
  queryFunction: () => Promise<T>,
  queryName: string,
  table?: string
) {
  return withPerformanceMonitoring(queryFunction, `db_${queryName}`)()
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [alerts, setAlerts] = useState<string[]>([])

  const updateReport = useCallback(() => {
    const newReport = performanceMonitor.getReport()
    const newAlerts = performanceMonitor.getAlerts()
    
    setReport(newReport)
    setAlerts(newAlerts)
  }, [])

  const recordMetric = useCallback((
    name: string, 
    value: number, 
    unit: string, 
    tags?: Record<string, string>
  ) => {
    performanceMonitor.recordMetric(name, value, unit, tags)
    updateReport()
  }, [updateReport])

  const recordError = useCallback((
    message: string, 
    context?: Record<string, any>, 
    severity?: ErrorMetric['severity']
  ) => {
    performanceMonitor.recordError(message, context, severity)
    updateReport()
  }, [updateReport])

  return {
    report,
    alerts,
    recordMetric,
    recordError,
    updateReport,
    clear: () => {
      performanceMonitor.clear()
      updateReport()
    }
  }
}

// Performance monitoring for API routes
export function createApiPerformanceMiddleware() {
  return (req: Request, next: () => Promise<Response>) => {
    const startTime = Date.now()
    const url = req.url
    const method = req.method

    return next().then(response => {
      const duration = Date.now() - startTime
      
      performanceMonitor.recordMetric('api_request', duration, 'ms', {
        method,
        url: new URL(url).pathname,
        status: response.status.toString()
      })

      if (response.status >= 400) {
        performanceMonitor.recordError(
          `API Error: ${response.status} ${method} ${new URL(url).pathname}`,
          {
            method,
            url,
            status: response.status
          },
          response.status >= 500 ? 'high' : 'medium'
        )
      }

      return response
    }).catch(error => {
      const duration = Date.now() - startTime
      
      performanceMonitor.recordMetric('api_request', duration, 'ms', {
        method,
        url: new URL(url).pathname,
        status: 'error'
      })

      performanceMonitor.recordError(
        `API Exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          method,
          url,
          error: error instanceof Error ? error.stack : String(error)
        },
        'critical'
      )

      throw error
    })
  }
}

// Performance monitoring utilities are already exported above
