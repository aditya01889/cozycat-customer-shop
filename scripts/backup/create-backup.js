#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_PROJECT_ID = 'xfnbhheapralprcwjvzl';
const BACKUP_DIR = path.join(__dirname, '../../database/backups');
const CHANGE_LOG_FILE = path.join(__dirname, 'last-backup-hash.txt');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log('✅ Created backup directory', 'green');
  }
}

function getDatabaseHash() {
  try {
    // Get a hash of the current database state
    const query = `
      SELECT 
        md5(string_agg(
          table_name || '|' || 
          column_name || '|' || 
          data_type || '|' ||
          COALESCE(column_default, '') || '|' ||
          CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END,
          ',' ORDER BY table_name, ordinal_position
        )) as schema_hash
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `;
    
    const result = execSync(`supabase db dump --db-url "postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres" --schema=public --data-only --no-owner --no-privileges | md5sum`, { encoding: 'utf8' });
    return result.trim().split(' ')[0];
  } catch (error) {
    log('❌ Failed to get database hash', 'red');
    return Date.now().toString(); // Fallback to timestamp
  }
}

function getLastBackupHash() {
  try {
    if (fs.existsSync(CHANGE_LOG_FILE)) {
      return fs.readFileSync(CHANGE_LOG_FILE, 'utf8').trim();
    }
  } catch (error) {
    log('⚠️ Could not read last backup hash', 'yellow');
  }
  return null;
}

function saveBackupHash(hash) {
  try {
    fs.writeFileSync(CHANGE_LOG_FILE, hash);
    log('💾 Saved backup hash', 'blue');
  } catch (error) {
    log('❌ Failed to save backup hash', 'red');
  }
}

function hasDatabaseChanged() {
  const currentHash = getDatabaseHash();
  const lastHash = getLastBackupHash();
  
  log(`🔍 Current hash: ${currentHash}`, 'blue');
  log(`📋 Last hash: ${lastHash || 'none'}`, 'blue');
  
  return currentHash !== lastHash;
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  
  log('🚀 Starting database backup...', 'blue');
  
  try {
    // Create backup using Supabase CLI
    const command = `supabase db dump --db-url "postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres" --schema=public --data-only --no-owner --no-privileges > "${backupFile}"`;
    
    log('📡 Executing backup command...', 'blue');
    execSync(command, { stdio: 'inherit' });
    
    // Verify backup was created
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      log(`✅ Backup created successfully!`, 'green');
      log(`📁 File: ${path.basename(backupFile)}`, 'green');
      log(`📊 Size: ${fileSizeMB} MB`, 'green');
      
      // Save the hash to prevent duplicate backups
      const currentHash = getDatabaseHash();
      saveBackupHash(currentHash);
      
      // Clean up old backups (keep last 10)
      cleanupOldBackups();
      
      return true;
    } else {
      log('❌ Backup file was not created', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backup failed: ${error.message}`, 'red');
    return false;
  }
}

function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // Keep only the last 10 backups
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      log(`🧹 Cleaning up ${filesToDelete.length} old backups...`, 'yellow');
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        log(`🗑️ Deleted: ${file.name}`, 'yellow');
      });
    }
  } catch (error) {
    log(`⚠️ Cleanup failed: ${error.message}`, 'yellow');
  }
}

function main() {
  log('🔄 Database Backup Script', 'blue');
  log('================================', 'blue');
  
  // Check environment variables
  if (!process.env.SUPABASE_DB_PASSWORD) {
    log('❌ SUPABASE_DB_PASSWORD environment variable is required', 'red');
    log('💡 Set it in your .env file or export it before running', 'yellow');
    process.exit(1);
  }
  
  ensureBackupDir();
  
  // Check if database has changed
  if (hasDatabaseChanged()) {
    log('🔄 Database changes detected, creating backup...', 'yellow');
    const success = createBackup();
    
    if (success) {
      log('🎉 Backup completed successfully!', 'green');
      process.exit(0);
    } else {
      log('💥 Backup failed!', 'red');
      process.exit(1);
    }
  } else {
    log('✅ No database changes detected, skipping backup', 'green');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  hasDatabaseChanged,
  cleanupOldBackups
};
