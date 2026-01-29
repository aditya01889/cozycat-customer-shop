#!/usr/bin/env node

/**
 * Vercel Environment Variables Sync Script
 * 
 * This script syncs all environment variables to Vercel for different environments
 * Usage: node scripts/sync-vercel-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment files to sync
const ENVIRONMENTS = {
  production: '.env.production',
  staging: '.env.staging',
  development: '.env.development'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} failed:`, 'red');
    log(error.message, 'red');
    throw error;
  }
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`⚠️  Environment file not found: ${filePath}`, 'yellow');
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const envVars = {};
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      envVars[key] = cleanValue;
    }
  });
  
  return envVars;
}

function syncEnvironment(envName, envFile) {
  log(`\n🚀 Syncing ${envName} environment...`, 'cyan');
  log(`📁 File: ${envFile}`, 'blue');
  
  const envVars = parseEnvFile(envFile);
  
  if (Object.keys(envVars).length === 0) {
    log(`⚠️  No environment variables found in ${envFile}`, 'yellow');
    return;
  }
  
  log(`📊 Found ${Object.keys(envVars).length} environment variables`, 'blue');
  
  // Set each environment variable
  Object.entries(envVars).forEach(([key, value]) => {
    try {
      let command = `vercel env add "${key}"`;
      
      // Determine target environments
      let targetEnvs = [];
      
      if (envName === 'production') {
        targetEnvs = ['production', 'preview', 'development'];
      } else if (envName === 'staging') {
        targetEnvs = ['preview']; // Staging uses preview environment in Vercel
      } else if (envName === 'development') {
        targetEnvs = ['development'];
      }
      
      // Add the environment variable for each target
      targetEnvs.forEach(targetEnv => {
        const fullCommand = `${command} ${targetEnv}`;
        log(`   📝 Setting ${key} for ${targetEnv}`, 'blue');
        
        try {
          // Use echo to pipe the value to avoid command line exposure
          execSync(`echo "${value}" | ${fullCommand}`, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            shell: true 
          });
        } catch (error) {
          // If variable already exists, try to remove and re-add
          log(`   ⚠️  Variable ${key} might already exist, trying to update...`, 'yellow');
          try {
            execSync(`echo "${value}" | vercel env add "${key}" ${targetEnv}`, { 
              encoding: 'utf8', 
              stdio: 'pipe',
              shell: true 
            });
          } catch (updateError) {
            log(`   ⚠️  Could not update ${key}, skipping...`, 'yellow');
          }
        }
      });
      
    } catch (error) {
      log(`   ❌ Failed to set ${key}: ${error.message}`, 'red');
    }
  });
}

function verifySetup() {
  log('\n🔍 Verifying Vercel setup...', 'cyan');
  
  try {
    // Check if logged in to Vercel
    const whoami = execSync('vercel whoami', { encoding: 'utf8' }).trim();
    log(`✅ Logged in as: ${whoami}`, 'green');
    
    // Check project link
    const link = execSync('vercel link --confirm', { encoding: 'utf8' }).trim();
    log(`✅ Project linked: ${link}`, 'green');
    
  } catch (error) {
    log('❌ Vercel setup verification failed:', 'red');
    log('Please ensure you are logged in to Vercel and linked to the project:', 'red');
    log('1. Run: vercel login', 'red');
    log('2. Run: vercel link', 'red');
    throw error;
  }
}

function main() {
  log('🚀 Vercel Environment Variables Sync Script', 'bright');
  log('==========================================', 'bright');
  
  try {
    // Verify Vercel setup
    verifySetup();
    
    // Sync each environment
    Object.entries(ENVIRONMENTS).forEach(([envName, envFile]) => {
      syncEnvironment(envName, envFile);
    });
    
    log('\n🎉 Environment variables sync completed!', 'green');
    log('\n📋 Summary:', 'blue');
    log('   • Production variables: Production, Preview, Development environments', 'blue');
    log('   • Staging variables: Preview environment (staging branch)', 'blue');
    log('   • Development variables: Development environment only', 'blue');
    
    log('\n🌐 Next steps:', 'cyan');
    log('   1. Deploy to staging: git push origin staging', 'cyan');
    log('   2. Deploy to production: git push origin main', 'cyan');
    log('   3. Check deployments at: https://vercel.com/dashboard', 'cyan');
    
  } catch (error) {
    log('\n❌ Sync failed!', 'red');
    log('Please check the error messages above and try again.', 'red');
    process.exit(1);
  }
}

// Run the script
main();
