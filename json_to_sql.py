#!/usr/bin/env python3
"""
Convert JSON data from production-missing-data.md to SQL INSERT statements
"""

import json
import re
from typing import Dict, List, Any

def extract_json_sections(file_path: str) -> Dict[str, List[Dict]]:
    """Extract JSON sections from the markdown file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = {}
    
    # Define section patterns based on actual file format
    section_patterns = [
        ('ingredients', r'This is for ingredients table\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('product_ingredients', r'Product recipes\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('products', r'Products\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('product_variants', r'Product variants\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('orders', r'Orders\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('order_items', r'Order items\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('categories', r'Categories\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('packaging', r'Packaging\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('labels', r'Labels\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('customers', r'Customers\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('production_batches', r'Production batches\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('deliveries', r'Deliveries\s*-\s*\n(\s*\[.*?\])\n\n'),
        ('delivery_partners', r'Delivery Partners\s*-\s*\n(\s*\[.*?\])\s*$')
    ]
    
    for section_name, pattern in section_patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            try:
                data = json.loads(json_str)
                sections[section_name] = data
                print(f"✓ Extracted {len(data)} records from {section_name}")
            except json.JSONDecodeError as e:
                print(f"✗ Error parsing {section_name}: {e}")
                print(f"JSON snippet: {json_str[:200]}...")
        else:
            print(f"✗ Section {section_name} not found")
    
    return sections

def escape_sql_value(value: Any) -> str:
    """Escape SQL values properly"""
    if value is None:
        return 'NULL'
    elif isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, str):
        # Escape single quotes and wrap in single quotes
        escaped = value.replace("'", "''")
        return f"'{escaped}'"
    else:
        # Convert to string and escape
        escaped = str(value).replace("'", "''")
        return f"'{escaped}'"

def generate_insert_statement(table_name: str, columns: List[str], data: List[Dict]) -> str:
    """Generate INSERT statements for a table"""
    if not data:
        return f"-- No data for {table_name}\n"
    
    statements = [f"-- INSERT statements for {table_name}"]
    
    for record in data:
        values = []
        for col in columns:
            value = record.get(col)
            values.append(escape_sql_value(value))
        
        values_str = ', '.join(values)
        columns_str = ', '.join(columns)
        statements.append(f"INSERT INTO {table_name} ({columns_str}) VALUES ({values_str});")
    
    statements.append("")  # Empty line between tables
    return '\n'.join(statements)

def get_table_columns(table_name: str, sample_data: Dict) -> List[str]:
    """Get column names from sample data"""
    if not sample_data:
        return []
    
    # Sort columns to have consistent ordering
    # Common columns first, then alphabetical
    common_columns = ['id', 'created_at', 'updated_at']
    other_columns = [col for col in sample_data.keys() if col not in common_columns]
    other_columns.sort()
    
    # Put common columns at the beginning
    ordered_columns = [col for col in common_columns if col in sample_data.keys()]
    ordered_columns.extend(other_columns)
    
    return ordered_columns

def main():
    """Main conversion function"""
    input_file = 'production-missing-data.md'
    output_file = 'production_data_inserts.sql'
    
    print("Extracting JSON data from markdown file...")
    sections = extract_json_sections(input_file)
    
    if not sections:
        print("No data extracted. Exiting.")
        return
    
    print(f"\nGenerating SQL INSERT statements...")
    
    # Table name mappings
    table_mappings = {
        'ingredients': 'ingredients',
        'product_ingredients': 'product_ingredients',
        'products': 'products',
        'product_variants': 'product_variants',
        'orders': 'orders',
        'categories': 'categories',
        'customers': 'customers',
        'production_batches': 'production_batches',
        'deliveries': 'deliveries',
        'delivery_partners': 'delivery_partners'
        # Note: packaging, labels, order_items tables don't exist in production
    }
    
    all_sql = []
    all_sql.append("-- SQL INSERT statements generated from production-missing-data.md")
    all_sql.append("-- Generated on: " + str(__import__('datetime').datetime.now()))
    all_sql.append("")
    
    for section_name, table_name in table_mappings.items():
        if section_name in sections and sections[section_name]:
            data = sections[section_name]
            if data:
                columns = get_table_columns(table_name, data[0])
                sql = generate_insert_statement(table_name, columns, data)
                all_sql.append(sql)
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(all_sql))
    
    print(f"\n✓ SQL INSERT statements written to {output_file}")
    
    # Print summary
    total_records = sum(len(data) for data in sections.values())
    print(f"\nSummary:")
    print(f"- Total sections processed: {len(sections)}")
    print(f"- Total records: {total_records}")
    
    for section_name, data in sections.items():
        if data:
            table_name = table_mappings.get(section_name, section_name)
            print(f"- {table_name}: {len(data)} records")

if __name__ == "__main__":
    main()
