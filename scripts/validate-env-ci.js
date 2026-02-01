#!/usr/bin/env node

/**
 * CI Environment Variable Validation Script
 * 
 * This script validates environment variables for CI/CD environments
 * It's more lenient for non-production environments
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
  'your-razorpay-key',
  'your-google-maps-key'
];

// Get environment information
function getEnvironmentInfo() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isCI = process.env.CI === 'true';
  const isVercel = process.env.VERCEL === '1';
  const githubRef = process.env.GITHUB_REF || '';
  const githubEventName = process.env.GITHUB_EVENT_NAME || '';
  
  // Determine environment based on CI context
  let environment = 'development';
  if (isCI) {
    if (githubRef.includes('refs/heads/main')) {
      environment = 'production';
    } else if (githubRef.includes('refs/heads/staging') || githubRef.includes('refs/heads/develop')) {
      environment = 'staging';
    } else {
      environment = 'preview';
    }
  } else if (isVercel) {
    environment = 'production';
  } else if (nodeEnv === 'production') {
    environment = 'production';
  }
  
  return {
    environment,
    isCI,
    isVercel,
    nodeEnv,
    githubRef,
    githubEventName
  };
}

// Validate environment variables
function validateEnvironment(envInfo) {
  console.log(`🔍 Validating environment variables...`);
  console.log(`🏭 ${envInfo.environment.charAt(0).toUpperCase() + envInfo.environment.slice(1)} environment detected`);
  
  if (envInfo.isCI) {
    console.log(`🔄 CI Environment - validating process.env variables`);
  }
  
  // For CI preview environments, be more lenient
  if (envInfo.environment === 'preview' && envInfo.isCI) {
    console.log(`⚠️  Preview CI environment - skipping strict validation`);
    console.log(`✅ Environment validation passed (preview mode)`);
    console.log(`🛡️ Preview environment variables are acceptable for testing`);
    return;
  }
  
  // For staging, check if we have staging variables
  let hasIssues = false;
  const envVars = process.env;
  
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
      // Remove quotes for validation
      const cleanValue = value.replace(/^["']|["']$/g, '');
      if (!cleanValue.startsWith('https://') || !cleanValue.includes('.supabase.co')) {
        console.error(`❌ Invalid Supabase URL format: ${varName}`);
        console.error(`   Expected: https://project-ref.supabase.co`);
        console.error(`   Current: ${cleanValue}`);
        hasIssues = true;
        return;
      }
    }
    
    // Specific validation for Supabase keys
    if (varName.includes('SUPABASE') && varName.includes('KEY')) {
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
    
    if (envInfo.environment === 'production') {
      console.log('\n🔧 Production Environment - To fix:');
      console.log('1. Check Vercel environment variables in dashboard');
      console.log('2. Ensure all critical variables are set');
      console.log('3. Verify no placeholder values are present');
      console.log('4. Redeploy after fixing variables');
    } else if (envInfo.environment === 'staging') {
      console.log('\n🔧 Staging Environment - To fix:');
      console.log('1. Add staging environment variables to GitHub Secrets');
      console.log('2. Ensure VERCEL_ENVIRONMENT secrets are configured');
      console.log('3. Check Vercel project settings for staging environment');
    } else {
      console.log('\n🔧 CI Environment - To fix:');
      console.log('1. Add environment variables to GitHub Secrets');
      console.log('2. Check repository settings > Secrets and variables > Actions');
    }
    
    process.exit(1);
  }
  
  console.log('\n✅ Environment validation passed!');
  console.log(`🛡️ ${envInfo.environment.charAt(0).toUpperCase() + envInfo.environment.slice(1)} environment variables are properly configured.`);
}

// Main execution
function main() {
  try {
    const envInfo = getEnvironmentInfo();
    validateEnvironment(envInfo);
  } catch (error) {
    console.error('❌ Validation script error:', error.message);
    process.exit(1);
  }
}

// Run the validation
main();
