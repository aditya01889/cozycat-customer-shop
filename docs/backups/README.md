# 🗄️ Database Backup System

## Overview

This backup system provides automated and manual database backups for your CozyCat Kitchen application. It uses Supabase CLI to create SQL dumps of your production database and includes change detection to avoid unnecessary backups.

## Features

- ✅ **Automated daily backups** at 2:00 AM
- ✅ **Change detection** - only backs up when database has changed
- ✅ **Automatic cleanup** - keeps only the 10 most recent backups
- ✅ **Cross-platform** - Works on Windows, Mac, and Linux
- ✅ **Logging** - Detailed logs for all backup operations
- ✅ **Notifications** - Optional Discord/Slack notifications
- ✅ **NPM scripts** - Easy to use commands

## Quick Start

### 1. Manual Backup
```bash
# Run backup with change detection
npm run backup:run

# Force backup (ignores change detection)
npm run backup:force

# Check backup status
npm run backup:status

# List all backups
npm run backup:list
```

### 2. Automated Daily Backup
```bash
# Setup automated daily backups
npm run backup:daily:setup

# Run daily backup manually
npm run backup:daily

# Check daily backup status
npm run backup:daily:status

# Test daily backup process
npm run backup:daily:test
```

## File Structure

```
scripts/backup/
├── simple-backup.js      # Core backup functionality
├── daily-backup.js       # Automated daily backup
├── test-backup.js        # Backup testing utilities
└── daily-backup.log      # Backup log file

database/backups/
├── backup-2026-02-07T18-19-45.sql  # Backup files
└── ...                           # More backup files
```

## Backup Files

### Naming Convention
- Format: `backup-YYYY-MM-DDTHH-MM-SS.sql`
- Example: `backup-2026-02-07T18-19-45.sql`
- Timestamp in UTC

### File Contents
- **Data only** (no schema definitions)
- **Public schema** only (excludes auth, extensions)
- **No owner/privilege statements**
- **Compressed format** using COPY statements

### Storage Location
- Local: `database/backups/`
- Automatic cleanup keeps last 10 backups
- Size: Typically 0.1-0.5 MB per backup

## Configuration

### Environment Variables
```bash
# Optional: Discord webhook for notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Backup Schedule
- **Time**: 2:00 AM daily (UTC)
- **Platform**: 
  - Windows: Task Scheduler
  - Mac/Linux: Cron job
- **Change Detection**: Enabled by default

## Usage Examples

### Manual Operations
```bash
# Create a backup now
npm run backup:run

# Force backup even if no changes detected
npm run backup:force

# See backup status and recent files
npm run backup:status

# List all available backups
npm run backup:list
```

### Automated Operations
```bash
# Setup automated daily backups
npm run backup:daily:setup

# Manually run the daily backup process
npm run backup:daily

# Check automated backup status
npm run backup:daily:status

# Test the daily backup process
npm run backup:daily:test
```

### Direct Script Usage
```bash
# Use backup scripts directly
cd scripts/backup

# Simple backup
node simple-backup.js run
node simple-backup.js force
node simple-backup.js status
node simple-backup.js list

# Daily backup
node daily-backup.js run
node daily-backup.js setup
node daily-backup.js status
node daily-backup.js test
```

## Change Detection

The backup system uses a simple change detection mechanism:

1. **Hash Generation**: Creates a hash based on backup file timestamps
2. **Comparison**: Compares current hash with last backup hash
3. **Decision**: Creates backup only if hashes differ

### Current Implementation
- Uses file modification times as proxy for changes
- Always creates backup for first run
- Can be enhanced with actual database content hashing

## Troubleshooting

### Common Issues

#### 1. Docker Not Running
```
❌ Docker is not running
```
**Solution**: Start Docker Desktop
```bash
# Start Docker Desktop application
# Or start Docker service (Linux)
sudo systemctl start docker
```

#### 2. Supabase CLI Issues
```
failed to inspect docker image
```
**Solution**: Ensure Docker is running and Supabase CLI is updated
```bash
npx supabase --version
npx supabase update
```

#### 3. Permission Issues
```
Permission denied
```
**Solution**: Check file permissions and run as administrator if needed

#### 4. Backup File Not Created
```
❌ Backup file was not created
```
**Solution**: 
- Check Docker status
- Verify Supabase project access
- Check disk space

### Log Files

Check the backup log for detailed error information:
```bash
# View daily backup log
cat scripts/backup/daily-backup.log

# View recent logs
tail -f scripts/backup/daily-backup.log
```

## Advanced Configuration

### Custom Backup Schedule

#### Windows (Task Scheduler)
```bash
# Open Task Scheduler
taskschd.msc

# Find task: "CozyCat-Daily-Backup"
# Right-click → Properties → Triggers
# Modify schedule as needed
```

#### Linux/Mac (Cron)
```bash
# Edit cron jobs
crontab -e

# Find line with "daily-backup.js"
# Modify time schedule (0 2 * * * = 2 AM daily)
```

### Custom Backup Location

To change backup location, modify the `BACKUP_DIR` constant in:
- `scripts/backup/simple-backup.js`
- `scripts/backup/daily-backup.js`

```javascript
const BACKUP_DIR = path.join(__dirname, '../../custom-backups');
```

### Notification Setup

#### Discord Webhook
1. Create Discord server
2. Go to Server Settings → Integrations → Webhooks
3. Create webhook and copy URL
4. Set environment variable:
```bash
export DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

#### Email Notifications
Extend the `sendNotification()` function in `daily-backup.js` to include email alerts.

## Recovery Process

### From Backup File
```bash
# Restore using psql
psql "postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" < backup-2026-02-07T18-19-45.sql

# Or using Supabase CLI
npx supabase db reset --local
# Then manually import the backup file
```

### Important Notes
- ⚠️ **Test restores** in staging environment first
- ⚠️ **Stop application** during restore
- ⚠️ **Verify data integrity** after restore
- ⚠️ **Keep multiple backups** for safety

## Monitoring

### Backup Health Check
```bash
# Check backup status
npm run backup:status

# Check automated backup status
npm run backup:daily:status

# View backup logs
cat scripts/backup/daily-backup.log
```

### Metrics to Monitor
- ✅ Backup frequency (daily)
- ✅ Backup file sizes
- ✅ Backup success rate
- ✅ Disk space usage
- ✅ Change detection effectiveness

## Best Practices

### 1. Regular Testing
- Test backup restoration monthly
- Verify backup file integrity
- Test automated scheduling

### 2. Multiple Locations
- Store backups in multiple locations
- Use cloud storage for critical backups
- Consider off-site storage

### 3. Security
- Protect backup files with appropriate permissions
- Encrypt sensitive backup data
- Limit access to backup files

### 4. Documentation
- Document restore procedures
- Maintain backup schedule
- Record any backup incidents

## Integration with CI/CD

### Pre-Deployment Backup
```bash
# Add to deployment script
npm run backup:force
```

### Automated Testing
```bash
# Add to CI pipeline
npm run backup:daily:test
```

## Support

### Getting Help
1. Check this documentation
2. Review backup logs
3. Test with manual backup
4. Check Docker and Supabase CLI status

### Common Commands
```bash
# Quick status check
npm run backup:status

# Force backup if needed
npm run backup:force

# Test automated backup
npm run backup:daily:test

# Setup automated backups
npm run backup:daily:setup
```

---

**Last Updated**: 2026-02-07  
**Version**: 1.0  
**Compatible with**: Supabase CLI v2.72.8+
