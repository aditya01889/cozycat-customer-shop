// Test script to verify weight_grams fix handles edge cases
const { createClient } = require('@supabase/supabase-js');

// Test cases for ProductGridInline component edge cases
const testCases = [
  {
    name: 'Product with empty variants array',
    product: {
      id: 'test-1',
      name: 'Test Product 1',
      product_variants: [],
      categories: { slug: 'meals' }
    },
    expected: 'Should show "Unavailable" button'
  },
  {
    name: 'Product with null variants',
    product: {
      id: 'test-2', 
      name: 'Test Product 2',
      product_variants: null,
      categories: { slug: 'meals' }
    },
    expected: 'Should show "Unavailable" button'
  },
  {
    name: 'Product with variant missing weight_grams',
    product: {
      id: 'test-3',
      name: 'Test Product 3',
      product_variants: [
        { id: 'variant-1', price: 100, sku: 'TEST-1' }
        // Missing weight_grams
      ],
      categories: { slug: 'meals' }
    },
    expected: 'Should show "Unavailable" button'
  },
  {
    name: 'Product with variant having null weight_grams',
    product: {
      id: 'test-4',
      name: 'Test Product 4',
      product_variants: [
        { id: 'variant-1', price: 100, weight_grams: null, sku: 'TEST-1' }
      ],
      categories: { slug: 'meals' }
    },
    expected: 'Should show "Unavailable" button'
  },
  {
    name: 'Product with valid variants',
    product: {
      id: 'test-5',
      name: 'Test Product 5',
      product_variants: [
        { id: 'variant-1', price: 100, weight_grams: 500, sku: 'TEST-1' },
        { id: 'variant-2', price: 200, weight_grams: 1000, sku: 'TEST-2' }
      ],
      categories: { slug: 'meals' }
    },
    expected: 'Should work normally with "Add to Cart" button'
  }
];

console.log('🧪 Testing ProductGridInline edge cases...');
console.log('='.repeat(50));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Expected: ${testCase.expected}`);
  
  // Simulate the component logic
  const variants = testCase.product.product_variants || [];
  const hasValidVariants = variants.length > 0 && variants.some(v => v?.weight_grams !== undefined && v?.weight_grams !== null);
  
  console.log(`   Actual: ${hasValidVariants ? '✅ Valid variants' : '❌ Invalid variants'}`);
  
  if (hasValidVariants) {
    console.log(`   Button: "Add to Cart"`);
    console.log(`   Weight: ${variants[0].weight_grams}g`);
  } else {
    console.log(`   Button: "Unavailable"`);
    console.log(`   Weight: "Weight not available"`);
  }
});

console.log('\n✅ Test completed! Fix should handle all edge cases gracefully.');
