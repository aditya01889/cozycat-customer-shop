#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Function to get file size in KB
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return (stats.size / 1024).toFixed(2)
  } catch (error) {
    return '0'
  }
}

// Function to analyze component files
function analyzeComponents(dir, maxDepth = 3) {
  const components = []
  
  function scanDirectory(currentDir, depth = 0) {
    if (depth > maxDepth) return
    
    try {
      const items = fs.readdirSync(currentDir)
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath, depth + 1)
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          const size = getFileSize(fullPath)
          const relativePath = path.relative(process.cwd(), fullPath)
          
          components.push({
            name: item,
            path: relativePath,
            size: parseFloat(size),
            sizeKB: size + ' KB'
          })
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${currentDir}`, error.message)
    }
  }
  
  scanDirectory(dir)
  return components.sort((a, b) => b.size - a.size)
}

// Function to analyze pages
function analyzePages(dir) {
  const pages = []
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir)
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath)
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          const size = getFileSize(fullPath)
          const relativePath = path.relative(process.cwd(), fullPath)
          
          pages.push({
            name: item,
            path: relativePath,
            size: parseFloat(size),
            sizeKB: size + ' KB'
          })
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${currentDir}`, error.message)
    }
  }
  
  scanDirectory(dir)
  return pages.sort((a, b) => b.size - a.size)
}

// Main analysis function
function main() {
  console.log('📊 Bundle Size Analysis')
  console.log('=====================\n')
  
  // Analyze components
  console.log('🧩 Components Analysis:')
  const componentsDir = path.join(process.cwd(), 'components')
  if (fs.existsSync(componentsDir)) {
    const components = analyzeComponents(componentsDir)
    
    console.log(`Total components: ${components.length}`)
    console.log('Top 10 largest components:')
    
    components.slice(0, 10).forEach((component, index) => {
      const icon = component.size > 50 ? '🔴' : component.size > 20 ? '🟡' : '🟢'
      console.log(`${index + 1}. ${icon} ${component.name} - ${component.sizeKB} (${component.path})`)
    })
    
    const totalComponentSize = components.reduce((sum, comp) => sum + comp.size, 0)
    console.log(`Total component size: ${totalComponentSize.toFixed(2)} KB\n`)
  } else {
    console.log('Components directory not found\n')
  }
  
  // Analyze pages
  console.log('📄 Pages Analysis:')
  const pagesDir = path.join(process.cwd(), 'app')
  if (fs.existsSync(pagesDir)) {
    const pages = analyzePages(pagesDir)
    
    console.log(`Total pages: ${pages.length}`)
    console.log('Top 10 largest pages:')
    
    pages.slice(0, 10).forEach((page, index) => {
      const icon = page.size > 50 ? '🔴' : page.size > 20 ? '🟡' : '🟢'
      console.log(`${index + 1}. ${icon} ${page.name} - ${page.sizeKB} (${page.path})`)
    })
    
    const totalPageSize = pages.reduce((sum, page) => sum + page.size, 0)
    console.log(`Total page size: ${totalPageSize.toFixed(2)} KB\n`)
  } else {
    console.log('App directory not found\n')
  }
  
  // Recommendations
  console.log('💡 Recommendations:')
  console.log('==================')
  
  const allComponents = fs.existsSync(componentsDir) ? analyzeComponents(componentsDir) : []
  const largeComponents = allComponents.filter(comp => comp.size > 30)
  
  if (largeComponents.length > 0) {
    console.log('🔴 Large components to consider splitting:')
    largeComponents.forEach(comp => {
      console.log(`   - ${comp.name} (${comp.sizeKB})`)
    })
  }
  
  const allPages = fs.existsSync(pagesDir) ? analyzePages(pagesDir) : []
  const largePages = allPages.filter(page => page.size > 30)
  
  if (largePages.length > 0) {
    console.log('🔴 Large pages to consider optimizing:')
    largePages.forEach(page => {
      console.log(`   - ${page.name} (${page.sizeKB})`)
    })
  }
  
  console.log('\n🚀 Optimization Tips:')
  console.log('   1. Use dynamic imports for large components')
  console.log('   2. Split components into smaller, focused pieces')
  console.log('   3. Use React.memo for expensive components')
  console.log('   4. Implement code splitting with Next.js dynamic imports')
  console.log('   5. Use Suspense boundaries for better loading states')
}

// Run the analysis
if (require.main === module) {
  main()
}

module.exports = { analyzeComponents, analyzePages }
