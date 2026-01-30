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

  // In CI dummy mode we intentionally do not require real secrets.
  // This enables build/test to run without production/staging credentials.
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    console.warn('⚠️  CI_DUMMY_ENV enabled - skipping strict environment variable validation');
    console.log('\n✅ Environment validation passed (CI dummy mode)!');
    return;
  }
  
  // Check if we're in production/CI environment (Vercel, etc.)
  // Use VERCEL_ENV first, then fallback to NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV || 'development';
  const isProduction = vercelEnv === 'production';
  const isPreview = vercelEnv === 'preview';

  console.log(`🔍 Environment detection: VERCEL_ENV=${process.env.VERCEL_ENV}, NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`🔍 Parsed: vercelEnv=${vercelEnv}, isProduction=${isProduction}, isPreview=${isPreview}`);

  // Guard against double execution during Next.js build
  if (process.env.__ENV_VALIDATED__) {
    console.log('⚠️ Environment already validated in this build, skipping...');
    process.exit(0);
  }
  process.env.__ENV_VALIDATED__ = 'true';
  
  let envVars = {};
  
  if (isProduction) {
    // In production, use process.env directly
    console.log('🏭 Production environment detected - validating process.env variables');
    envVars = process.env;
  } else if (isPreview) {
    // In preview (staging), use process.env directly but with preview context
    console.log('🔍 Preview environment detected - validating process.env variables');
    envVars = process.env;
  } else {
    // In development, check for .env.local file
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local file not found!');
      console.log('💡 Please create .env.local from .env.example');
      process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
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
  }
  
  let hasIssues = false;
  
  // Check critical variables with environment-specific strictness
  CRITICAL_VARS.forEach(varName => {
    const value = envVars[varName];
    
    if (!value) {
      if (isProduction) {
        console.error(`❌ Missing: ${varName}`);
        hasIssues = true;
      } else {
        console.log(`ℹ️ Preview environment - ${varName} not set, skipping validation`);
      }
      return;
    }
    
    // Check for placeholder values
    const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => 
      value.toLowerCase().includes(pattern)
    );
    
    if (isPlaceholder) {
      if (isProduction) {
        console.error(`❌ Placeholder value detected: ${varName}`);
        console.error(`   Current value: ${value.substring(0, 50)}...`);
        hasIssues = true;
      } else {
        console.log(`ℹ️ Preview environment - placeholder value in ${varName}, skipping validation`);
      }
      return;
    }
    
    // Specific validation for Supabase URL (only in production)
    if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
      // Remove quotes for validation
      const cleanValue = value.replace(/^["']|["']$/g, '');
      if (!cleanValue.startsWith('https://') || !cleanValue.includes('.supabase.co')) {
        if (isProduction) {
          console.error(`❌ Invalid Supabase URL format: ${varName}`);
          console.error(`   Expected: https://project-id.supabase.co`);
          console.error(`   Current: ${cleanValue}`);
          hasIssues = true;
        } else {
          console.log(`ℹ️ Preview environment - invalid URL format in ${varName}, skipping validation`);
        }
        return;
      }
    }
    
    // Specific validation for API keys (only in production)
    if (varName.includes('KEY')) {
      try {
        // Basic JWT format check
        const parts = value.split('.');
        if (parts.length !== 3) {
          if (isProduction) {
            console.error(`❌ Invalid JWT format: ${varName}`);
            hasIssues = true;
          } else {
            console.log(`ℹ️ Preview environment - invalid JWT format in ${varName}, skipping validation`);
          }
          return;
        }
        
        // Check if it's a valid base64 string
        try {
          Buffer.from(parts[1], 'base64');
        } catch (e) {
          if (isProduction) {
            console.error(`❌ Invalid base64 in JWT: ${varName}`);
            hasIssues = true;
          } else {
            console.log(`ℹ️ Preview environment - invalid base64 in ${varName}, skipping validation`);
          }
          return;
        }
      } catch (e) {
        if (isProduction) {
          console.error(`❌ Error validating ${varName}:`, e.message);
          hasIssues = true;
        } else {
          console.log(`ℹ️ Preview environment - error validating ${varName}, skipping validation`);
        }
        return;
      }
    }
    
    console.log(`✅ ${varName}: Valid`);
  });
  
  if (hasIssues) {
    console.log('\n❌ Environment validation failed!');
    
    if (isProduction) {
      console.log('\n🔧 Production Environment - To fix:');
      console.log('1. Check Vercel environment variables in dashboard');
      console.log('2. Ensure all critical variables are set');
      console.log('3. Verify no placeholder values are present');
      console.log('4. Redeploy after fixing variables');
      process.exit(1);
    } else {
      console.log('\nℹ️ Preview environment - some validation issues detected, but continuing...');
      console.log('🔧 To fix preview environment issues:');
      console.log('1. Check Vercel environment variables for Preview environment');
      console.log('2. Ensure staging variables are properly set');
      console.log('3. Redeploy to preview after fixing variables');
      console.log('\n✅ Environment validation passed (preview mode)!');
      return; // Don't exit with error in preview
    }
  }
  
  console.log('\n✅ Environment validation passed!');
  if (isProduction) {
    console.log('🛡️ Your production environment variables are properly configured.');
  } else {
    console.log('🔍 Your preview environment variables are configured.');
  }
}

// Create backup if it doesn't exist (development only)
function createBackup() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.CI || process.env.VERCEL;
  
  if (isProduction) {
    // Skip backup in production
    return;
  }
  
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
