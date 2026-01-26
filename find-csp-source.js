/**
 * CSP Source Finder
 * Identifies where CSP is being set from
 */

const fs = require('fs')
const path = require('path')

async function findCSPSource() {
  console.log('🔍 Finding CSP Source...')
  console.log('=' .repeat(50))
  
  // Test 1: Check current CSP from server
  console.log('📋 Testing current CSP from server...')
  try {
    const response = await fetch('http://localhost:3000/checkout', { method: 'HEAD' })
    const serverCSP = response.headers.get('content-security-policy')
    console.log('🌐 Server CSP:', serverCSP)
  } catch (error) {
    console.log('❌ Server not accessible')
  }
  
  // Test 2: Search for CSP in all files
  console.log('\n🔍 Searching for CSP in codebase...')
  
  const searchDirs = [
    '.',
    'lib',
    'app',
    'components',
    'contexts'
  ]
  
  let cspFound = []
  
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      searchDirectory(dir, cspFound)
    }
  }
  
  console.log(`\n📊 Found ${cspFound.length} CSP references:`)
  cspFound.forEach((item, index) => {
    console.log(`${index + 1}. ${item.file}:${item.line} - ${item.content}`)
  })
  
  // Test 3: Check for middleware
  console.log('\n🔍 Checking for middleware files...')
  const middlewareFiles = [
    'middleware.ts',
    'middleware.js',
    'lib/middleware.ts',
    'lib/middleware.js'
  ]
  
  for (const middlewareFile of middlewareFiles) {
    if (fs.existsSync(middlewareFile)) {
      console.log(`✅ Found middleware: ${middlewareFile}`)
      const content = fs.readFileSync(middlewareFile, 'utf8')
      if (content.includes('Content-Security-Policy') || content.includes('CSP')) {
        console.log(`🔍 CSP found in ${middlewareFile}`)
        console.log(content)
      }
    }
  }
  
  // Test 4: Check Next.js config
  console.log('\n🔍 Checking Next.js configuration...')
  const configFiles = [
    'next.config.js',
    'next.config.ts'
  ]
  
  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      console.log(`✅ Found config: ${configFile}`)
      const content = fs.readFileSync(configFile, 'utf8')
      if (content.includes('Content-Security-Policy')) {
        console.log(`🔍 CSP found in ${configFile}`)
        const lines = content.split('\n')
        lines.forEach((line, index) => {
          if (line.includes('Content-Security-Policy')) {
            console.log(`   Line ${index + 1}: ${line.trim()}`)
          }
        })
      }
    }
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('🏁 CSP Source Analysis Complete')
}

function searchDirectory(dir, results) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      searchDirectory(fullPath, results)
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        const lines = content.split('\n')
        
        lines.forEach((line, index) => {
          if (line.includes('Content-Security-Policy') || 
              line.includes('frame-src') || 
              line.includes('connect-src') ||
              line.includes('checkout.razorpay.com')) {
            results.push({
              file: fullPath,
              line: index + 1,
              content: line.trim()
            })
          }
        })
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
}

// Run the analysis
findCSPSource().catch(console.error)
