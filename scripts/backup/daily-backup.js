#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import backup functions
const { createBackup, hasDatabaseChanged, listBackups } = require('./simple-backup');

// Configuration
const LOG_FILE = path.join(__dirname, 'daily-backup.log');
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
  // Check if Docker is running
  try {
    execSync('docker info', { stdio: 'ignore' });
    log('✅ Docker is running', 'green');
  } catch (error) {
    log('❌ Docker is not running', 'red');
    return false;
  }
  
  return true;
}

function sendNotification(message, type = 'info') {
  log(`📢 Notification: ${message}`, type === 'error' ? 'red' : 'cyan');
  
  // You can integrate with Slack, Discord, Email, etc.
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
      sendNotification('❌ Daily backup failed: Docker is not running', 'error');
      return false;
    }
    
    // Check if database has changed
    if (hasDatabaseChanged()) {
      log('🔄 Database changes detected, creating backup...', 'yellow');
      
      const success = createBackup();
      
      if (success) {
        log('🎉 Daily backup completed successfully!', 'green');
        sendNotification('✅ Daily database backup completed successfully');
        return true;
      } else {
        log('💥 Daily backup failed!', 'red');
        sendNotification('❌ Daily database backup failed', 'error');
        return false;
      }
    } else {
      log('✅ No database changes detected, backup skipped', 'green');
      sendNotification('ℹ️ No database changes detected, backup skipped for today');
      return true;
    }
    
  } catch (error) {
    log(`💥 Unexpected error during backup: ${error.message}`, 'red');
    sendNotification(`❌ Unexpected backup error: ${error.message}`, 'error');
    return false;
  }
}

function setupCronJob() {
  log('⏰ Setting up automated daily backup...', 'cyan');
  
  try {
    // Create a cron job using Windows Task Scheduler equivalent
    const cronCommand = `node "${path.join(__dirname, 'daily-backup.js')}" run`;
    
    if (process.platform === 'win32') {
      // Windows: Use Task Scheduler
      log('🪟 Setting up Windows Task Scheduler...', 'blue');
      
      const taskName = 'CozyCat-Daily-Backup';
      const taskScript = `
@echo off
cd /d "${path.resolve(__dirname, '../..')}"
node scripts/backup/daily-backup.js run
`;
      
      const batchFile = path.join(__dirname, 'run-backup.bat');
      fs.writeFileSync(batchFile, taskScript);
      
      const createTaskCommand = `schtasks /create /tn "${taskName}" /tr "${batchFile}" /sc daily /st 02:00 /f`;
      execSync(createTaskCommand, { stdio: 'inherit' });
      
      log('✅ Windows Task Scheduler job created', 'green');
      log(`📅 Task will run daily at 2:00 AM`, 'green');
      log(`🔧 To manage: Taskschd.msc`, 'blue');
      
    } else {
      // Linux/Mac: Use cron
      log('🐧 Setting up cron job...', 'blue');
      
      const cronLine = `0 2 * * * cd ${path.resolve(__dirname, '../..')} && node scripts/backup/daily-backup.js run >> ${LOG_FILE} 2>&1`;
      
      try {
        execSync(`(crontab -l 2>/dev/null; echo "${cronLine}") | crontab -`, { stdio: 'inherit' });
        log('✅ Cron job created', 'green');
        log(`📅 Job will run daily at 2:00 AM`, 'green');
        log(`🔧 To manage: crontab -e`, 'blue');
      } catch (error) {
        log('⚠️ Failed to create cron job', 'yellow');
        log('💡 You may need to run: crontab -e and add manually:', 'yellow');
        log(`   ${cronLine}`, 'cyan');
      }
    }
    
    log('🎉 Automated backup setup completed!', 'green');
    
  } catch (error) {
    log(`❌ Failed to setup automated backup: ${error.message}`, 'red');
  }
}

function showStatus() {
  log('📊 Daily Backup Status', 'blue');
  log('====================', 'blue');
  
  // Check environment
  if (checkEnvironment()) {
    log('✅ Environment is ready', 'green');
  } else {
    log('❌ Environment issues detected', 'red');
  }
  
  // List recent backups
  listBackups();
  
  // Show log file info
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    log(`📝 Log file: ${LOG_FILE}`, 'blue');
    log(`📊 Log size: ${(stats.size / 1024).toFixed(2)} KB`, 'blue');
    log(`📅 Last modified: ${stats.mtime.toISOString()}`, 'blue');
  }
  
  // Show next scheduled backup
  const now = new Date();
  const nextBackup = new Date();
  nextBackup.setHours(2, 0, 0, 0);
  if (nextBackup <= now) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }
  
  log(`⏰ Next scheduled backup: ${nextBackup.toISOString()}`, 'cyan');
}

function main() {
  const command = process.argv[2] || 'run';
  
  log('🌙 Daily Backup Script', 'blue');
  log('====================', 'blue');
  
  switch (command) {
    case 'run':
      performDailyBackup();
      break;
      
    case 'setup':
      setupCronJob();
      break;
      
    case 'status':
      showStatus();
      break;
      
    case 'test':
      log('🧪 Running test backup...', 'yellow');
      const success = performDailyBackup();
      log(`📊 Test result: ${success ? 'SUCCESS' : 'FAILED'}`, success ? 'green' : 'red');
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node daily-backup.js run    - Run daily backup', 'cyan');
      log('  node daily-backup.js setup  - Setup automated scheduling', 'cyan');
      log('  node daily-backup.js status - Show backup status', 'cyan');
      log('  node daily-backup.js test   - Test backup process', 'cyan');
      break;
  }
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

if (require.main === module) {
  main();
}

module.exports = {
  performDailyBackup,
  setupCronJob,
  showStatus
};
