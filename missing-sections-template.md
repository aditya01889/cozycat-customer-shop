# Template for adding missing sections to production-missing-data.md

## Add these sections at the end of the file (before Production batches):

Order items - 
[PASTE THE JSON OUTPUT FROM order_items QUERY HERE]

Categories - 
[PASTE THE JSON OUTPUT FROM categories QUERY HERE]

Packaging - 
[PASTE THE JSON OUTPUT FROM packaging QUERY HERE]

Labels - 
[PASTE THE JSON OUTPUT FROM labels QUERY HERE]

Customers - 
[PASTE THE JSON OUTPUT FROM customers QUERY HERE]

## Instructions:

1. Run each SQL query from extract-missing-data.sql on your production database
2. Copy the JSON output (the array result)
3. Paste it in the corresponding section above
4. Add these sections to the end of production-missing-data.md file
5. Run the python script again: python json_to_sql.py
6. The updated production_data_inserts.sql will include all tables

## Example format:
Order items - 
[
  {
    "id": "uuid-here",
    "order_id": "uuid-here", 
    "product_variant_id": "uuid-here",
    "quantity": 2,
    "unit_price": "50.00",
    "total_price": "100.00",
    "created_at": "2026-01-01 00:00:00+00",
    "updated_at": "2026-01-01 00:00:00+00"
  }
]
