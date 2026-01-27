#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that critical environment variables are properly set
 * and warns if they contain placeholder values.
 * 
 * Usage: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Critical environment variables that should NOT be placeholder values
const CRITICAL_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Placeholder patterns to detect
const PLACEHOLDER_PATTERNS = [
  'your-project-id',
  'your-anon-key',
  'your-service-role-key',
  'placeholder',
  'your-email',
  'your-app-password',
  'your-resend-key',
  'your-key-id',
  'your-key-secret',
  'your-maps-api-key'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('💡 Please create .env.local from .env.example');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  // Parse .env.local content
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  
  let hasIssues = false;
  
  // Check critical variables
  CRITICAL_VARS.forEach(varName => {
    const value = envVars[varName];
    
    if (!value) {
      console.error(`❌ Missing: ${varName}`);
      hasIssues = true;
      return;
    }
    
    // Check for placeholder values
    const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => 
      value.toLowerCase().includes(pattern)
    );
    
    if (isPlaceholder) {
      console.error(`❌ Placeholder value detected: ${varName}`);
      console.error(`   Current value: ${value.substring(0, 50)}...`);
      hasIssues = true;
      return;
    }
    
    // Specific validation for Supabase URL
    if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        console.error(`❌ Invalid Supabase URL format: ${varName}`);
        console.error(`   Expected: https://project-id.supabase.co`);
        console.error(`   Current: ${value}`);
        hasIssues = true;
        return;
      }
    }
    
    // Specific validation for API keys
    if (varName.includes('KEY')) {
      try {
        // Basic JWT format check
        const parts = value.split('.');
        if (parts.length !== 3) {
          console.error(`❌ Invalid JWT format: ${varName}`);
          hasIssues = true;
          return;
        }
        
        // Check if it's a valid base64 string
        try {
          Buffer.from(parts[1], 'base64');
        } catch (e) {
          console.error(`❌ Invalid base64 in JWT: ${varName}`);
          hasIssues = true;
          return;
        }
      } catch (e) {
        console.error(`❌ Error validating ${varName}:`, e.message);
        hasIssues = true;
        return;
      }
    }
    
    console.log(`✅ ${varName}: Valid`);
  });
  
  if (hasIssues) {
    console.log('\n❌ Environment validation failed!');
    console.log('\n🔧 To fix:');
    console.log('1. Update .env.local with correct values');
    console.log('2. Copy from Vercel environment variables if available');
    console.log('3. Or restore from .env.backup: cp .env.backup .env.local');
    console.log('4. Restart development server');
    process.exit(1);
  }
  
  console.log('\n✅ Environment validation passed!');
  console.log('🛡️ Your environment variables are properly configured.');
}

// Create backup if it doesn't exist
function createBackup() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const backupPath = path.join(__dirname, '..', '.env.backup');
  
  if (fs.existsSync(envPath) && !fs.existsSync(backupPath)) {
    console.log('💾 Creating backup of .env.local...');
    fs.copyFileSync(envPath, backupPath);
    console.log('✅ Backup created: .env.backup');
  }
}

// Run validation
if (require.main === module) {
  createBackup();
  validateEnvironment();
}
