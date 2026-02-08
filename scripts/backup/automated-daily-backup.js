#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Import our backup functions
const { createBackup, hasDatabaseChanged } = require('./create-backup');

// Configuration
const LOG_FILE = path.join(__dirname, 'backup.log');
const BACKUP_SCHEDULE = '0 2 * * *'; // 2 AM daily

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(`${colors[color]}${logMessage}${colors.reset}`);
  
  // Also write to log file
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (error) {
    // Ignore log file errors
  }
}

function checkEnvironment() {
  const required = ['SUPABASE_DB_PASSWORD'];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  return true;
}

function sendNotification(message, type = 'info') {
  // You can integrate with Slack, Discord, Email, etc.
  log(`📢 Notification: ${message}`, type === 'error' ? 'red' : 'cyan');
  
  // Example: Send to Discord webhook
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      const webhookData = {
        content: message,
        username: 'Database Backup Bot',
        color: type === 'error' ? 0xFF0000 : 0x00FF00
      };
      
      execSync(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(webhookData)}' "${process.env.DISCORD_WEBHOOK_URL}"`, { stdio: 'ignore' });
    } catch (error) {
      log('⚠️ Failed to send Discord notification', 'yellow');
    }
  }
}

function performDailyBackup() {
  log('🌙 Starting scheduled daily backup...', 'blue');
  log('================================', 'blue');
  
  try {
    // Check environment
    if (!checkEnvironment()) {
      sendNotification('❌ Daily backup failed: Missing environment variables', 'error');
      return;
    }
    
    // Check if database has changed
    if (hasDatabaseChanged()) {
      log('🔄 Database changes detected, creating backup...', 'yellow');
      
      const success = createBackup();
      
      if (success) {
        log('🎉 Daily backup completed successfully!', 'green');
        sendNotification('✅ Daily database backup completed successfully');
      } else {
        log('💥 Daily backup failed!', 'red');
        sendNotification('❌ Daily database backup failed', 'error');
      }
    } else {
      log('✅ No database changes detected, backup skipped', 'green');
      sendNotification('ℹ️ No database changes detected, backup skipped for today');
    }
    
  } catch (error) {
    log(`💥 Unexpected error during backup: ${error.message}`, 'red');
    sendNotification(`❌ Unexpected backup error: ${error.message}`, 'error');
  }
}

function startScheduledBackup() {
  log('🚀 Starting automated backup scheduler...', 'cyan');
  log(`⏰ Schedule: ${BACKUP_SCHEDULE} (2 AM daily)`, 'cyan');
  log('📝 Logs will be written to: backup.log', 'cyan');
  log('🔔 Notifications enabled for backup events', 'cyan');
  log('================================', 'cyan');
  
  // Validate environment before starting
  if (!checkEnvironment()) {
    log('❌ Cannot start scheduler: Missing environment variables', 'red');
    process.exit(1);
  }
  
  // Schedule the backup
  cron.schedule(BACKUP_SCHEDULE, () => {
    performDailyBackup();
  });
  
  log('✅ Backup scheduler started successfully!', 'green');
  log('🌙 Next backup will run at 2:00 AM', 'green');
  
  // Keep the process running
  log('⏳ Scheduler is running... Press Ctrl+C to stop', 'blue');
}

function runOnce() {
  log('🏃 Running backup once (manual mode)...', 'cyan');
  performDailyBackup();
}

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'start':
  case 'schedule':
    startScheduledBackup();
    break;
    
  case 'run':
  case 'once':
    runOnce();
    break;
    
  case 'status':
    log('📊 Backup Status Check', 'blue');
    log('================================', 'blue');
    
    if (checkEnvironment()) {
      log('✅ Environment variables are configured', 'green');
      
      if (hasDatabaseChanged()) {
        log('🔄 Database changes detected since last backup', 'yellow');
      } else {
        log('✅ No database changes since last backup', 'green');
      }
    } else {
      log('❌ Environment variables are missing', 'red');
    }
    break;
    
  default:
    log('📖 Usage:', 'blue');
    log('  node automated-daily-backup.js start   - Start scheduled backup service', 'cyan');
    log('  node automated-daily-backup.js run     - Run backup once', 'cyan');
    log('  node automated-daily-backup.js status  - Check backup status', 'cyan');
    break;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Received SIGINT, shutting down gracefully...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Received SIGTERM, shutting down gracefully...', 'yellow');
  process.exit(0);
});
