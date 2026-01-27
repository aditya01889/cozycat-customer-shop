#!/usr/bin/env node

/**
 * Script to add production safety to all debug endpoints
 * This prevents debug endpoints from being accessible in production
 */

const fs = require('fs')
const path = require('path')

const debugEndpoints = [
  'app/api/admin/debug-profiles/route.ts',
  'app/api/admin/debug-join/route.ts', 
  'app/api/admin/fix-missing-profiles/route.ts',
  'app/api/admin/test-profiles/route.ts',
  'app/api/debug/auth/route.ts',
  'app/api/debug/full-auth/route.ts',
  'app/api/debug/session/route.ts'
]

const productionImport = "import { requireDevelopmentMode, addProductionWarning } from '@/lib/utils/production-check'"
const productionCheck = "// Block debug endpoints in production\n    requireDevelopmentMode('ENDPOINT_NAME')"

debugEndpoints.forEach(endpoint => {
  const filePath = path.join(process.cwd(), endpoint)
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Add import if not present
    if (!content.includes('requireDevelopmentMode')) {
      content = content.replace(
        /import.*from '@\/lib\/env-validation'/,
        `$&\nimport { requireDevelopmentMode, addProductionWarning } from '@/lib/utils/production-check'`
      )
    }
    
    // Add production check to preCheck
    const endpointName = endpoint.split('/')[2]
    content = content.replace(
      /preCheck: async \(req: NextRequest\) => \{[\s\S]*?const \{ createClient \}/,
      `preCheck: async (req: NextRequest) => {\n    // Block debug endpoints in production\n    requireDevelopmentMode('${endpointName}')\n    \n    const { createClient }`
    )
    
    // Update warning message
    content = content.replace(
      /warning: 'This is a debug endpoint - remove from production'/,
      "warning: 'This is a debug endpoint - not available in production'"
    )
    
    fs.writeFileSync(filePath, content)
    console.log(`✅ Secured: ${endpoint}`)
  } else {
    console.log(`❌ Not found: ${endpoint}`)
  }
})

console.log('🔒 Debug endpoints secured for production')
