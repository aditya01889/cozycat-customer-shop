#!/usr/bin/env node

const fs = require('fs');

console.log('📦 Extracting original product variants from backup...');

// Read the backup file
const backupContent = fs.readFileSync('database-backup-before-excel-migration.sql', 'utf8');

// Find the product_variants section
const variantsSection = backupContent.match(/-- Data for Name: product_variants[\s\S]*?(?=\n\n--|$)/s);

if (variantsSection) {
  const variantsText = variantsSection[0];
  
  // Extract all INSERT statements for product_variants
  const insertStatements = variantsText.match(/INSERT INTO.*?VALUES\s*(.*?);/gs);
  
  if (insertStatements) {
    console.log('📋 Found original product variants:\n');
    
    insertStatements.forEach((statement, index) => {
      // Extract the VALUES part
      const valuesMatch = statement.match(/VALUES\s*(.*)/);
      if (valuesMatch) {
        const values = valuesMatch[1];
        
        // Extract individual variant records
        const variantRecords = values.match(/\(.*?\)/g);
        
        variantRecords.forEach((record, recordIndex) => {
          // Clean up the record and split by commas
          const cleanRecord = record.replace(/[()]/g, '');
          const parts = cleanRecord.split(',').map(part => part.trim().replace(/'/g, ''));
          
          if (parts.length >= 6) {
            const id = parts[0];
            const product_id = parts[1];
            const weight_grams = parts[2];
            const price = parts[3];
            const sku = parts[4];
            const is_active = parts[5];
            
            console.log(`${index + 1}.${recordIndex + 1} Product ID: ${product_id}`);
            console.log(`   Weight: ${weight_grams}g`);
            console.log(`   Price: ₹${price}`);
            console.log(`   SKU: ${sku}`);
            console.log(`   Active: ${is_active}`);
            console.log('');
          }
        });
      }
    });
  }
} else {
  console.log('❌ No product_variants section found in backup');
}
