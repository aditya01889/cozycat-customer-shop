/**
 * Production safety utilities
 * Prevents debug endpoints from being accessible in production
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function requireDevelopmentMode(endpointName: string): never {
  if (isProduction()) {
    throw new Error(
      `Endpoint ${endpointName} is not available in production mode. ` +
      `This is a debug endpoint intended for development use only.`
    )
  }
}

export function addProductionWarning(endpointName: string): string {
  const warning = isProduction() 
    ? `⚠️ PRODUCTION WARNING: ${endpointName} should be removed before production deployment`
    : `🔧 Development endpoint: ${endpointName} is only available in development mode`
  
  console.warn(warning)
  return warning
}
