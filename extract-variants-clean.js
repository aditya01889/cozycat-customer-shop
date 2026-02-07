#!/usr/bin/env node

const fs = require('fs');

console.log('📦 Extracting clean product variants data...');

// Read the backup file
const backupContent = fs.readFileSync('database-backup-before-excel-migration.sql', 'utf8');

// Find all product variant lines
const lines = backupContent.split('\n');
const variants = [];
let inVariantsSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('-- Data for Name: product_variants')) {
    inVariantsSection = true;
    continue;
  }
  
  if (inVariantsSection && line.includes('-- Data for Name:') && !line.includes('product_variants')) {
    break; // End of variants section
  }
  
  if (inVariantsSection && line.includes("INSERT INTO") && line.includes("product_variants")) {
    // Continue reading VALUES lines
    i++; // Move to next line
    while (i < lines.length && !lines[i].includes(';')) {
      const valuesLine = lines[i].trim();
      if (valuesLine.startsWith('(') && valuesLine.endsWith(',')) {
        // Extract variant data
        const cleanLine = valuesLine.slice(1, -1); // Remove ( and ,
        const parts = cleanLine.split(',').map(part => part.trim().replace(/'/g, ''));
        
        if (parts.length >= 6) {
          variants.push({
            id: parts[0],
            product_id: parts[1],
            weight_grams: parts[2],
            price: parseFloat(parts[3]),
            sku: parts[4],
            is_active: parts[5] === 'true'
          });
        }
      }
      i++;
    }
    
    // Handle last line (with ;)
    if (i < lines.length) {
      const lastLine = lines[i].trim();
      if (lastLine.startsWith('(') && lastLine.endsWith(');')) {
        const cleanLine = lastLine.slice(1, -2); // Remove ( and );
        const parts = cleanLine.split(',').map(part => part.trim().replace(/'/g, ''));
        
        if (parts.length >= 6) {
          variants.push({
            id: parts[0],
            product_id: parts[1],
            weight_grams: parts[2],
            price: parseFloat(parts[3]),
            sku: parts[4],
            is_active: parts[5] === 'true'
          });
        }
      }
    }
  }
}

console.log(`\n📋 Found ${variants.length} product variants:\n`);

// Group by product_id to see variants per product
const variantsByProduct = {};
variants.forEach(variant => {
  if (!variantsByProduct[variant.product_id]) {
    variantsByProduct[variant.product_id] = [];
  }
  variantsByProduct[variant.product_id].push(variant);
});

// Display variants by product
Object.keys(variantsByProduct).forEach(productId => {
  const productVariants = variantsByProduct[productId];
  console.log(`Product ID: ${productId}`);
  productVariants.forEach((variant, index) => {
    console.log(`  ${index + 1}. Weight: ${variant.weight_grams}g, Price: ₹${variant.price}, SKU: ${variant.sku}`);
  });
  console.log('');
});

console.log(`\n✅ Total variants found: ${variants.length}`);
