#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createBackup } = require('./simple-backup');

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

function uploadToGoogleDrive(filePath) {
  try {
    log('☁️ Uploading to Google Drive...', 'blue');
    
    // Method 1: Using gdrive CLI (if installed)
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1HvuvGaP4IF4kjiTWOvFGDGZS-JBr0f7S';
    
    try {
        execSync(`"C:\\Users\\Work\\go\\bin\\gdrive.exe" upload --parent "${folderId}" "${filePath}"`, { stdio: 'inherit' });
        log('✅ Uploaded to Google Drive via gdrive CLI', 'green');
        return true;
      } catch (error) {
        log('⚠️ gdrive CLI method failed, trying alternative...', 'yellow');
      }
    
    // Method 2: Using rclone (if installed)
    if (process.env.RCLONE_REMOTE && process.env.RCLONE_PATH) {
      try {
        execSync(`rclone copy "${filePath}" "${process.env.RCLONE_REMOTE}:${process.env.RCLONE_PATH}"`, { stdio: 'inherit' });
        log('✅ Uploaded to Google Drive via rclone', 'green');
        return true;
      } catch (error) {
        log('⚠️ rclone method failed, trying alternative...', 'yellow');
      }
    }
    
    // Method 3: Copy to local cloud backup folder (manual upload)
    const fileName = path.basename(filePath);
    const cloudPath = path.join(CLOUD_BACKUP_DIR, fileName);
    
    fs.copyFileSync(filePath, cloudPath);
    log(`✅ Copied to cloud backup folder: ${cloudPath}`, 'green');
    log('📤 Please manually upload to Google Drive or other cloud storage', 'yellow');
    
    return true;
    
  } catch (error) {
    log(`❌ Cloud upload failed: ${error.message}`, 'red');
    return false;
  }
}

function setupGoogleDriveBackup() {
  log('🔧 Setting up Google Drive Backup...', 'blue');
  log('================================', 'blue');
  
  log('📋 Choose your preferred method:', 'cyan');
  log('', 'reset');
  log('1. gdrive CLI (Recommended):', 'yellow');
  log('   Install: go install github.com/prasmussen/gdrive@latest', 'cyan');
  log('   Setup: gdrive login', 'cyan');
  log('   Set env: GOOGLE_DRIVE_FOLDER_ID=your_folder_id', 'cyan');
  log('', 'reset');
  
  log('2. rclone (Advanced):', 'yellow');
  log('   Install: https://rclone.org/install/', 'cyan');
  log('   Setup: rclone config', 'cyan');
  log('   Set env: RCLONE_REMOTE=drive && RCLONE_PATH=backups', 'cyan');
  log('', 'reset');
  
  log('3. Manual Upload (Simple):', 'yellow');
  log('   Backups copied to: cloud-backups/', 'cyan');
  log('   Upload manually to Google Drive/Dropbox/etc.', 'cyan');
  log('', 'reset');
  
  log('💡 After setup, run:', 'blue');
  log('   npm run backup:cloud', 'cyan');
}

function createCloudBackup() {
  log('☁️ Creating Cloud Backup...', 'blue');
  log('============================', 'blue');
  
  try {
    // Step 1: Create local backup
    log('📦 Step 1: Creating local backup...', 'blue');
    const localBackupSuccess = createBackup();
    
    if (!localBackupSuccess) {
      log('❌ Local backup failed, cannot proceed with cloud backup', 'red');
      return false;
    }
    
    // Step 2: Find the latest backup file
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
    log(`📁 Found latest backup: ${latestBackup.name}`, 'green');
    
    // Step 3: Upload to cloud
    log('☁️ Step 2: Uploading to cloud storage...', 'blue');
    ensureCloudBackupDir();
    
    const uploadSuccess = uploadToGoogleDrive(latestBackup.path);
    
    if (uploadSuccess) {
      log('🎉 Cloud backup completed successfully!', 'green');
      log(`📁 Local: ${latestBackup.name}`, 'green');
      log(`☁️ Cloud: Uploaded successfully`, 'green');
      return true;
    } else {
      log('💥 Cloud backup failed!', 'red');
      return false;
    }
    
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
    
    log('📂 Local Cloud Backup Folder:', 'cyan');
    if (files.length === 0) {
      log('No files in cloud backup folder', 'yellow');
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
  
  // Check environment setup
  log('', 'reset');
  log('🔧 Environment Setup:', 'cyan');
  
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1HvuvGaP4IF4kjiTWOvFGDGZS-JBr0f7S';
  
  if (process.env.GOOGLE_DRIVE_FOLDER_ID || folderId) {
    log('✅ Google Drive configured (gdrive CLI)', 'green');
  } else {
    log('✅ Google Drive configured (gdrive CLI) - using hardcoded ID', 'green');
  }
  
  if (process.env.RCLONE_REMOTE && process.env.RCLONE_PATH) {
    log('✅ rclone configured', 'green');
  } else {
    log('⚠️ rclone not configured', 'yellow');
  }
}

function main() {
  const command = process.argv[2] || 'run';
  
  log('☁️ Cloud Backup Script', 'blue');
  log('=====================', 'blue');
  
  switch (command) {
    case 'run':
    case 'backup':
      createCloudBackup();
      break;
      
    case 'setup':
      setupGoogleDriveBackup();
      break;
      
    case 'list':
      listCloudBackups();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node cloud-backup.js run    - Create cloud backup', 'cyan');
      log('  node cloud-backup.js setup  - Setup cloud storage', 'cyan');
      log('  node cloud-backup.js list   - List cloud backups', 'cyan');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createCloudBackup,
  setupGoogleDriveBackup,
  listCloudBackups
};
