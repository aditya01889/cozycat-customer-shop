#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createBackup } = require('./simple-backup');

const BACKUP_DIR = path.join(__dirname, '../../database/backups');
const CLOUD_BACKUP_DIR = path.join(__dirname, '../../cloud-backups');

function log(message, color = 'reset') {
  const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', reset: '\x1b[0m' };
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function createCloudBackup() {
  log('☁️ Creating Cloud Backup...', 'blue');
  
  // Step 1: Create local backup
  const success = createBackup();
  if (!success) {
    log('❌ Local backup failed', 'red');
    return false;
  }
  
  // Step 2: Copy to cloud backup folder
  if (!fs.existsSync(CLOUD_BACKUP_DIR)) {
    fs.mkdirSync(CLOUD_BACKUP_DIR, { recursive: true });
  }
  
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
  
  fs.copyFileSync(latestBackup.path, cloudPath);
  
  log(`✅ Backup copied to cloud folder: ${latestBackup.name}`, 'green');
  log(`📂 Location: ${CLOUD_BACKUP_DIR}`, 'green');
  log(`📤 Upload to Google Drive manually`, 'yellow');
  
  // Open the cloud backup folder
  execSync(`explorer "${CLOUD_BACKUP_DIR}"`, { stdio: 'ignore' });
  
  return true;
}

if (require.main === module) {
  createCloudBackup();
}
