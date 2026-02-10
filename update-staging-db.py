#!/usr/bin/env python3
"""
Script to update staging database with production data
"""

import os
import sys
import subprocess
from pathlib import Path

def run_sql_file(sql_file_path, db_connection_string):
    """
    Execute SQL file using psql
    """
    try:
        cmd = [
            'psql', 
            db_connection_string,
            '-f', sql_file_path
        ]
        
        print(f"Executing {sql_file_path}...")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        print("✅ SQL executed successfully")
        if result.stdout:
            print("Output:", result.stdout)
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error executing SQL: {e}")
        if e.stderr:
            print("Error output:", e.stderr)
        return False
    except FileNotFoundError:
        print("❌ psql command not found. Please ensure PostgreSQL client tools are installed.")
        return False

def backup_staging_db(db_connection_string):
    """
    Create a backup of staging database before updating
    """
    try:
        backup_file = "staging_backup_$(date +%Y%m%d_%H%M%S).sql"
        cmd = [
            'pg_dump',
            db_connection_string,
            '-f', backup_file
        ]
        
        print(f"Creating backup: {backup_file}")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Backup created: {backup_file}")
        return backup_file
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error creating backup: {e}")
        return None
    except FileNotFoundError:
        print("❌ pg_dump command not found. Please ensure PostgreSQL client tools are installed.")
        return None

def main():
    """
    Main function to update staging database
    """
    # Configuration
    sql_file = "production_data_inserts.sql"
    
    # Get database connection string from environment or prompt
    db_connection = os.getenv('STAGING_DB_CONNECTION')
    if not db_connection:
        print("Please set STAGING_DB_CONNECTION environment variable")
        print("Example: export STAGING_DB_CONNECTION='postgresql://user:password@host:port/database'")
        print("Or enter it now:")
        db_connection = input("Staging database connection string: ").strip()
        
        if not db_connection:
            print("❌ No database connection provided")
            sys.exit(1)
    
    # Check if SQL file exists
    if not Path(sql_file).exists():
        print(f"❌ SQL file not found: {sql_file}")
        print("Please run the JSON to SQL conversion first:")
        print("python json_to_sql.py")
        sys.exit(1)
    
    # Get file size for user confirmation
    file_size = Path(sql_file).stat().st_size
    print(f"📄 SQL file: {sql_file} ({file_size:,} bytes)")
    
    # Show preview of SQL file
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            print(f"📊 Total SQL statements: {len([l for l in lines if l.strip().startswith('INSERT')])}")
            
            # Show first few lines
            print("\n📝 Preview (first 5 lines):")
            for i, line in enumerate(lines[:5]):
                print(f"  {i+1}: {line.rstrip()}")
                
    except Exception as e:
        print(f"⚠️  Could not preview SQL file: {e}")
    
    # Confirm before proceeding
    print(f"\n🎯 Target database: {db_connection}")
    confirm = input("\n⚠️  This will update the staging database. Continue? (y/N): ").strip().lower()
    
    if confirm not in ['y', 'yes']:
        print("❌ Operation cancelled")
        sys.exit(0)
    
    # Create backup
    print("\n📦 Creating backup...")
    backup_file = backup_staging_db(db_connection)
    if not backup_file:
        print("⚠️  Continuing without backup...")
    
    # Execute SQL
    print("\n🚀 Updating staging database...")
    success = run_sql_file(sql_file, db_connection)
    
    if success:
        print("\n✅ Staging database updated successfully!")
        if backup_file:
            print(f"📦 Backup available: {backup_file}")
        print("\n🎉 Process completed!")
    else:
        print("\n❌ Failed to update staging database")
        if backup_file:
            print(f"📦 You can restore from backup: {backup_file}")
        sys.exit(1)

def show_usage():
    """Show usage instructions"""
    print("""
Usage: python update-staging-db.py

Environment Variables:
    STAGING_DB_CONNECTION    PostgreSQL connection string for staging database
    
Examples:
    # Set environment variable
    export STAGING_DB_CONNECTION='postgresql://user:password@localhost:5432/staging_db'
    python update-staging-db.py
    
    # Or run interactively
    python update-staging-db.py

Prerequisites:
    - PostgreSQL client tools (psql, pg_dump) must be installed
    - production_data_inserts.sql must exist (run json_to_sql.py first)
    """)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        show_usage()
        sys.exit(0)
    
    main()
