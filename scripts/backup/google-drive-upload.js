#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createBackup } = require('./simple-backup');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../database/backups');
const CLOUD_BACKUP_DIR = path.join(__dirname, '../../cloud-backups');

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
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function ensureCloudBackupDir() {
  if (!fs.existsSync(CLOUD_BACKUP_DIR)) {
    fs.mkdirSync(CLOUD_BACKUP_DIR, { recursive: true });
    log('✅ Created cloud backup directory', 'green');
  }
}

function uploadToGoogleDriveManual() {
  log('📋 Manual Google Drive Upload Instructions:', 'cyan');
  log('==========================================', 'cyan');
  log('', 'reset');
  log('1. 🌐 Open Google Drive:', 'yellow');
  log('   https://drive.google.com', 'blue');
  log('', 'reset');
  log('2. 📁 Find your backup folder:', 'yellow');
  log(`   ${CLOUD_BACKUP_DIR}`, 'blue');
  log('', 'reset');
  log('3. 📤 Upload the backup files:', 'yellow');
  log('   - Drag and drop .sql files to Google Drive', 'blue');
  log('   - Or click "New" → "File upload"', 'blue');
  log('', 'reset');
  log('4. 📂 Recommended folder structure:', 'yellow');
  log('   CozyCat-Backups/', 'cyan');
  log('   ├── 2026-02/', 'blue');
  log('   ├── 2026-01/', 'blue');
  log('   └── backup-2026-02-07T21-01-30.sql', 'green');
  log('', 'reset');
  log('5. ✅ Benefits of manual upload:', 'yellow');
  log('   ✓ No authentication required', 'green');
  log('   ✓ Works with any Google account', 'green');
  log('   ✓ Full control over file organization', 'green');
  log('', 'reset');
  
  // Open Google Drive in browser
  execSync('start https://drive.google.com', { stdio: 'ignore' });
  
  // Open cloud backup folder
  execSync(`explorer "${CLOUD_BACKUP_DIR}"`, { stdio: 'ignore' });
}

function createCloudBackup() {
  log('☁️ Creating Cloud Backup (Manual Method)...', 'blue');
  log('==========================================', 'blue');
  
  try {
    // Step 1: Create local backup
    log('📦 Step 1: Creating local backup...', 'blue');
    const success = createBackup();
    
    if (!success) {
      log('❌ Local backup failed, cannot proceed with cloud backup', 'red');
      return false;
    }
    
    // Step 2: Copy to cloud backup folder
    log('📂 Step 2: Preparing files for upload...', 'blue');
    ensureCloudBackupDir();
    
    // Find latest backup
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      log('❌ No backup files found', 'red');
      return false;
    }
    
    const latestBackup = files[0];
    const cloudPath = path.join(CLOUD_BACKUP_DIR, latestBackup.name);
    
    // Copy to cloud backup folder
    fs.copyFileSync(latestBackup.path, cloudPath);
    
    log(`✅ Latest backup copied: ${latestBackup.name}`, 'green');
    log(`📊 Size: ${(fs.statSync(cloudPath).size / (1024 * 1024)).toFixed(2)} MB`, 'green');
    log(`📂 Cloud backup folder: ${CLOUD_BACKUP_DIR}`, 'green');
    
    // Step 3: Show manual upload instructions
    log('📤 Step 3: Opening Google Drive for manual upload...', 'blue');
    uploadToGoogleDriveManual();
    
    return true;
    
  } catch (error) {
    log(`❌ Cloud backup error: ${error.message}`, 'red');
    return false;
  }
}

function listCloudBackups() {
  log('☁️ Cloud Backup Status', 'blue');
  log('====================', 'blue');
  
  // List local cloud backup folder
  if (fs.existsSync(CLOUD_BACKUP_DIR)) {
    const files = fs.readdirSync(CLOUD_BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(CLOUD_BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / (1024 * 1024)).toFixed(2),
          created: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    log('📂 Files ready for upload:', 'cyan');
    if (files.length === 0) {
      log('No files ready for upload', 'yellow');
    } else {
      files.forEach((file, index) => {
        log(`${index + 1}. ${file.name}`, 'cyan');
        log(`   Size: ${file.size} MB`, 'cyan');
        log(`   Created: ${file.created}`, 'cyan');
        log('', 'reset');
      });
    }
  } else {
    log('📂 Cloud backup folder not created yet', 'yellow');
  }
  
  log('', 'reset');
  log('📋 Manual Upload Process:', 'cyan');
  log('1. Run: npm run backup:cloud', 'yellow');
  log('2. Upload files from cloud-backups/ folder to Google Drive', 'yellow');
  log('3. Organize in CozyCat-Backups/2026-02/ structure', 'yellow');
}

function main() {
  const command = process.argv[2] || 'run';
  
  log('☁️ Google Drive Backup (Manual Upload)', 'blue');
  log('=====================================', 'blue');
  
  switch (command) {
    case 'run':
    case 'backup':
      createCloudBackup();
      break;
      
    case 'list':
      listCloudBackups();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node google-drive-upload.js run  - Create backup and show upload instructions', 'cyan');
      log('  node google-drive-upload.js list - List files ready for upload', 'cyan');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createCloudBackup,
  listCloudBackups
};
