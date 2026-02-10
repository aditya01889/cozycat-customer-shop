#!/usr/bin/env python3
"""
Script to update Supabase staging database using REST API
"""

import os
import sys
import json
import time
import requests
from pathlib import Path

class SupabaseDB:
    def __init__(self, url, service_key):
        self.url = url
        self.service_key = service_key
        self.headers = {
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    
    def clear_table(self, table_name):
        """Clear all data from a table"""
        try:
            response = requests.delete(
                f'{self.url}/rest/v1/{table_name}',
                headers=self.headers
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error clearing {table_name}: {e}")
            return False
    
    def insert_data(self, table_name, data):
        """Insert data into a table"""
        try:
            response = requests.post(
                f'{self.url}/rest/v1/{table_name}',
                headers=self.headers,
                json=data
            )
            return response.status_code in [200, 201]
        except Exception as e:
            print(f"Error inserting into {table_name}: {e}")
            return False

def parse_sql_file(sql_file_path):
    """Parse SQL INSERT statements and extract data"""
    tables_data = {}
    current_table = None
    current_data = []
    
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by INSERT statements
    insert_statements = [stmt.strip() for stmt in content.split('INSERT INTO') if stmt.strip() and 'VALUES' in stmt]
    
    for stmt in insert_statements:
        # Extract table name
        if 'INSERT INTO' in stmt:
            parts = stmt.split('INSERT INTO')[1].split('(')[0].strip()
            table_name = parts
            current_table = table_name
            
            if current_table not in tables_data:
                tables_data[current_table] = []
        
        # Extract JSON-like data from VALUES
        if 'VALUES' in stmt:
            values_part = stmt.split('VALUES')[1].strip()
            # Remove trailing semicolon and split by records
            records = values_part.rstrip(';').split('),(')
            
            for record in records:
                # Clean up the record string
                record = record.strip('();')
                if record:
                    # Parse the values into a dictionary
                    values = [v.strip().strip("'\"") for v in record.split(',')]
                    
                    # Create dict based on table structure (simplified)
                    if current_table == 'ingredients':
                        if len(values) >= 9:
                            tables_data[current_table].append({
                                'id': values[0],
                                'created_at': values[1],
                                'updated_at': values[2],
                                'current_stock': values[3],
                                'name': values[4],
                                'reorder_level': values[5],
                                'supplier': 'null' if values[6] == 'NULL' else values[6],
                                'unit': values[7],
                                'unit_cost': values[8]
                            })
                    # Add more table parsing as needed...
    
    return tables_data

def main():
    """Main function to update Supabase staging database"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not supabase_url:
        print("Please set SUPABASE_URL environment variable")
        supabase_url = input("Supabase URL: ").strip()
        if not supabase_url:
            sys.exit(1)
    
    if not supabase_key:
        print("Please set SUPABASE_SERVICE_KEY environment variable")
        supabase_key = input("Supabase service key: ").strip()
        if not supabase_key:
            sys.exit(1)
    
    # Check if SQL file exists
    sql_file = "production_data_inserts.sql"
    if not Path(sql_file).exists():
        print(f"❌ SQL file not found: {sql_file}")
        print("Please run: python json_to_sql.py")
        sys.exit(1)
    
    # Initialize Supabase client
    db = SupabaseDB(supabase_url, supabase_key)
    
    print(f"🎯 Target Supabase: {supabase_url}")
    print(f"📄 SQL file: {sql_file}")
    
    # Get file size
    file_size = Path(sql_file).stat().st_size
    print(f"📊 File size: {file_size:,} bytes")
    
    # Read SQL file content for manual execution
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Count INSERT statements
    insert_count = sql_content.count('INSERT INTO')
    print(f"📝 Total INSERT statements: {insert_count}")
    
    # Show preview
    print("\n📝 Preview (first 3 INSERT statements):")
    lines = sql_content.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith('INSERT INTO'):
            print(f"  {i+1}: {line[:100]}...")
            if i >= 2:  # Show first 3 INSERT statements
                break
    
    # Confirm
    print(f"\n⚠️  This will clear and insert data into staging tables.")
    confirm = input("Continue? (y/N): ").strip().lower()
    
    if confirm not in ['y', 'yes']:
        print("❌ Operation cancelled")
        sys.exit(0)
    
    # Tables to process (based on our SQL file)
    tables = [
        'ingredients', 'product_ingredients', 'products', 'product_variants',
        'orders', 'categories', 'customers', 'production_batches',
        'deliveries', 'delivery_partners'
    ]
    
    print("\n🚀 Updating Supabase staging database...")
    
    success_count = 0
    total_count = len(tables)
    
    for table in tables:
        print(f"\n📋 Processing {table}...")
        
        # Clear table
        print(f"  🗑️  Clearing {table}...")
        if not db.clear_table(table):
            print(f"  ❌ Failed to clear {table}")
            continue
        
        # For now, we'll provide manual SQL execution instructions
        # since parsing complex SQL is error-prone
        print(f"  ✅ {table} cleared")
        success_count += 1
    
    print(f"\n✅ Tables cleared: {success_count}/{total_count}")
    
    print(f"\n📋 Next Steps:")
    print(f"1. Go to your Supabase dashboard: {supabase_url}")
    print(f"2. Navigate to SQL Editor")
    print(f"3. Copy and paste the contents of {sql_file}")
    print(f"4. Execute the SQL script")
    
    print(f"\n🎉 Tables are ready for data insertion!")

if __name__ == "__main__":
    main()
