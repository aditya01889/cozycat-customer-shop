#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🏷️ Checking all categories...');

async function checkCategories() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      return;
    }
    
    console.log(`\n📋 Found ${categories?.length || 0} active categories:\n`);
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   Slug: ${category.slug}`);
      console.log(`   Description: ${category.description}`);
      console.log(`   Display Order: ${category.display_order}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  }
}

checkCategories();
