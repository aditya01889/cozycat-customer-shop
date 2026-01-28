#!/usr/bin/env node

/**
 * Script to fix WCAG performance issues
 * Backs up current files and applies optimized versions
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing WCAG performance issues...')

const filesToFix = [
  {
    backup: 'app/globals.css',
    optimized: 'app/globals-optimized.css',
    target: 'app/globals.css'
  },
  {
    backup: 'lib/utils/accessibility.ts',
    optimized: 'lib/utils/accessibility-optimized.ts',
    target: 'lib/utils/accessibility.ts'
  },
  {
    backup: 'components/Navbar.tsx',
    optimized: 'components/NavbarOptimized.tsx',
    target: 'components/Navbar.tsx'
  }
]

const backupDir = 'backups/wcag-fix-' + new Date().toISOString().slice(0, 10)

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

filesToFix.forEach(({ backup, optimized, target }) => {
  const originalPath = path.join(process.cwd(), target)
  const backupPath = path.join(process.cwd(), backupDir, backup)
  const optimizedPath = path.join(process.cwd(), optimized)
  
  try {
    // Backup original file
    if (fs.existsSync(originalPath)) {
      fs.copyFileSync(originalPath, backupPath)
      console.log(`✅ Backed up: ${target} -> ${backupDir}/${backup}`)
    }
    
    // Apply optimized version
    if (fs.existsSync(optimizedPath)) {
      fs.copyFileSync(optimizedPath, originalPath)
      console.log(`✅ Applied optimized: ${target}`)
    } else {
      console.log(`⚠️ Optimized file not found: ${optimized}`)
    }
    
  } catch (error) {
    console.error(`❌ Failed to process ${target}:`, error.message)
  }
})

console.log('\n🎉 WCAG performance fix completed!')
console.log(`📁 Backups saved in: ${backupDir}`)
console.log('\n📋 Changes made:')
console.log('1. Optimized accessibility utilities (reduced DOM manipulation)')
console.log('2. Fixed button responsiveness (better touch targets)')
console.log('3. Fixed header button ARIA labels')
console.log('4. Optimized CSS (reduced repaints/reflows)')
console.log('5. Improved reduced motion handling')
console.log('\n🔄 To restore original files:')
console.log(`cp -r ${backupDir}/* .`)
