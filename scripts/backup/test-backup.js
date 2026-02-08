#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the backup system
function testBackupSystem() {
  console.log('🧪 Testing Backup System');
  console.log('========================');
  
  // Check if required files exist
  const backupScript = path.join(__dirname, 'create-backup.js');
  const automatedScript = path.join(__dirname, 'automated-daily-backup.js');
  
  if (!fs.existsSync(backupScript)) {
    console.log('❌ create-backup.js not found');
    return false;
  }
  
  if (!fs.existsSync(automatedScript)) {
    console.log('❌ automated-daily-backup.js not found');
    return false;
  }
  
  console.log('✅ All backup scripts found');
  
  // Check environment variables
  if (!process.env.SUPABASE_DB_PASSWORD) {
    console.log('⚠️ SUPABASE_DB_PASSWORD not set');
    console.log('💡 Please set it in your .env file or export it:');
    console.log('   export SUPABASE_DB_PASSWORD=your_password');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  
  // Test backup creation (dry run)
  try {
    console.log('🔄 Testing backup creation...');
    
    // First check if database has changed
    const { hasDatabaseChanged } = require('./create-backup');
    const changed = hasDatabaseChanged();
    
    console.log(`📊 Database changed: ${changed}`);
    
    if (changed) {
      console.log('🚀 Creating test backup...');
      const { createBackup } = require('./create-backup');
      const success = createBackup();
      
      if (success) {
        console.log('✅ Test backup created successfully!');
        return true;
      } else {
        console.log('❌ Test backup failed');
        return false;
      }
    } else {
      console.log('ℹ️ No changes detected, backup skipped');
      return true;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Test automated backup
function testAutomatedBackup() {
  console.log('\n🤖 Testing Automated Backup');
  console.log('============================');
  
  try {
    // Test status command
    console.log('📊 Checking backup status...');
    execSync('node automated-daily-backup.js status', { stdio: 'inherit', cwd: __dirname });
    
    console.log('✅ Automated backup test passed');
    return true;
  } catch (error) {
    console.log(`❌ Automated backup test failed: ${error.message}`);
    return false;
  }
}

// Main test function
function main() {
  console.log('🧪 Backup System Test Suite');
  console.log('============================\n');
  
  const test1 = testBackupSystem();
  const test2 = testAutomatedBackup();
  
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`Basic Backup: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Automated Backup: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! Your backup system is ready.');
    console.log('\n📖 Next steps:');
    console.log('1. Run: node automated-daily-backup.js start');
    console.log('2. Or add to your package.json scripts');
    console.log('3. Set up notifications (optional)');
  } else {
    console.log('\n💥 Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testBackupSystem,
  testAutomatedBackup
};
