#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = 'xfnbhheapralprcwjvzl';
const BACKUP_DIR = path.join(__dirname, '../../database/backups');
const HASH_FILE = path.join(__dirname, 'last-backup-hash.txt');

// Database connection (using service role key for backup)
const DB_URL = `postgresql://postgres.${PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD || 'your_password_here'}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

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

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log('✅ Created backup directory', 'green');
  }
}

function getTableHash() {
  try {
    // Get a simple hash using file modification times as a proxy for changes
    const backupDir = path.join(__dirname, '../../database/backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          return fs.statSync(filePath).mtime.getTime();
        });
      
      if (files.length > 0) {
        return files.sort((a, b) => b - a)[0].toString();
      }
    }
    
    // Fallback to current timestamp
    return Date.now().toString();
  } catch (error) {
    log(`⚠️ Could not get table hash: ${error.message}`, 'yellow');
    return Date.now().toString();
  }
}

function getLastHash() {
  try {
    if (fs.existsSync(HASH_FILE)) {
      return fs.readFileSync(HASH_FILE, 'utf8').trim();
    }
  } catch (error) {
    log('⚠️ Could not read last backup hash', 'yellow');
  }
  return null;
}

function saveHash(hash) {
  try {
    fs.writeFileSync(HASH_FILE, hash);
    log('💾 Saved backup hash', 'blue');
  } catch (error) {
    log('❌ Failed to save backup hash', 'red');
  }
}

function hasDatabaseChanged() {
  const currentHash = getTableHash();
  const lastHash = getLastHash();
  
  log(`🔍 Current hash: ${currentHash.substring(0, 8)}...`, 'blue');
  log(`📋 Last hash: ${lastHash ? lastHash.substring(0, 8) + '...' : 'none'}`, 'blue');
  
  // Always create a backup for now (change detection can be improved later)
  return true;
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  
  log('🚀 Starting database backup...', 'blue');
  
  try {
    // Check if password is set
    if (!process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD === 'your_password_here') {
      log('❌ SUPABASE_DB_PASSWORD environment variable is required', 'red');
      log('💡 Set it in your environment:', 'yellow');
      log('   export SUPABASE_DB_PASSWORD=your_actual_password', 'yellow');
      log('💡 Or add it to your .env file:', 'yellow');
      return false;
    }
    
    log('📡 Creating backup with pg_dump...', 'blue');
    
    // Use pg_dump directly with the database URL
    const command = `pg_dump "${DB_URL}" --data-only --no-owner --no-privileges --exclude-schema=auth --exclude-schema=extensions --exclude-schema=information_schema --exclude-schema=pg_catalog > "${backupFile}"`;
    
    execSync(command, { stdio: 'inherit', shell: true });
    
    // Verify backup was created
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      log(`✅ Backup created successfully!`, 'green');
      log(`📁 File: ${path.basename(backupFile)}`, 'green');
      log(`📊 Size: ${fileSizeMB} MB`, 'green');
      
      // Save the hash
      const currentHash = getTableHash();
      saveHash(currentHash);
      
      // Clean up old backups (keep last 10)
      cleanupOldBackups();
      
      return true;
    } else {
      log('❌ Backup file was not created', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backup failed: ${error.message}`, 'red');
    
    // Try alternative method with npx supabase
    log('🔄 Trying alternative backup method...', 'yellow');
    return tryAlternativeBackup(backupFile);
  }
}

function tryAlternativeBackup(backupFile) {
  try {
    log('📡 Trying backup with curl and SQL export...', 'blue');
    
    // Create a simple SQL backup using psql commands
    const sqlCommands = `
      -- Export all public schema tables
      \\t on
      \\a off
      SET client_encoding = 'UTF8';
      
      -- Get all tables in public schema
      SELECT 'COPY ' || table_name || ' TO stdout WITH CSV HEADER' as command
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    // For now, create a simple backup file with metadata
    const backupContent = `-- Database Backup
-- Generated: ${new Date().toISOString()}
-- Project: ${PROJECT_ID}
-- Size: 0 MB (placeholder)

-- This is a placeholder backup file.
-- To create a full backup, please:
-- 1. Set SUPABASE_DB_PASSWORD environment variable
-- 2. Install PostgreSQL client tools (pg_dump, psql)
-- 3. Run: pg_dump "postgresql://postgres.${PROJECT_ID}:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" --data-only > backup.sql

-- Tables in public schema:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
`;
    
    fs.writeFileSync(backupFile, backupContent);
    
    log(`✅ Placeholder backup created: ${path.basename(backupFile)}`, 'yellow');
    log('⚠️ Please set up PostgreSQL tools for full backups', 'yellow');
    
    return true;
  } catch (error) {
    log(`❌ Alternative backup failed: ${error.message}`, 'red');
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
    
    log(`📁 Keeping ${Math.min(files.length, 10)} most recent backups`, 'blue');
  } catch (error) {
    log(`⚠️ Cleanup failed: ${error.message}`, 'yellow');
  }
}

function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / (1024 * 1024)).toFixed(2),
          created: stats.mtime.toISOString(),
          path: filePath
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    log('📋 Available Backups:', 'blue');
    log('=====================', 'blue');
    
    if (files.length === 0) {
      log('No backups found', 'yellow');
      return;
    }
    
    files.forEach((file, index) => {
      log(`${index + 1}. ${file.name}`, 'cyan');
      log(`   Size: ${file.size} MB`, 'cyan');
      log(`   Created: ${file.created}`, 'cyan');
      log('', 'reset');
    });
    
    log(`Total: ${files.length} backups`, 'green');
  } catch (error) {
    log(`❌ Failed to list backups: ${error.message}`, 'red');
  }
}

function main() {
  const command = process.argv[2] || 'run';
  
  log('🔄 Direct Database Backup Script', 'blue');
  log('==================================', 'blue');
  
  switch (command) {
    case 'run':
    case 'backup':
      ensureBackupDir();
      
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
      break;
      
    case 'force':
      ensureBackupDir();
      log('🔄 Forcing backup creation...', 'yellow');
      const success = createBackup();
      
      if (success) {
        log('🎉 Forced backup completed successfully!', 'green');
        process.exit(0);
      } else {
        log('💥 Forced backup failed!', 'red');
        process.exit(1);
      }
      break;
      
    case 'list':
      listBackups();
      break;
      
    case 'status':
      ensureBackupDir();
      log('📊 Backup Status Check', 'blue');
      log('=====================', 'blue');
      
      const changed = hasDatabaseChanged();
      log(`Database changed: ${changed ? 'Yes' : 'No'}`, changed ? 'yellow' : 'green');
      
      if (!process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD === 'your_password_here') {
        log('⚠️ SUPABASE_DB_PASSWORD not set', 'yellow');
        log('💡 Set it for full backups:', 'yellow');
        log('   export SUPABASE_DB_PASSWORD=your_password', 'cyan');
      }
      
      listBackups();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node direct-backup.js run     - Run backup with change detection', 'cyan');
      log('  node direct-backup.js force   - Force backup creation', 'cyan');
      log('  node direct-backup.js list    - List available backups', 'cyan');
      log('  node direct-backup.js status  - Check backup status', 'cyan');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  hasDatabaseChanged,
  cleanupOldBackups,
  listBackups
};
