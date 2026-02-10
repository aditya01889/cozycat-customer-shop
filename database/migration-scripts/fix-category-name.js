#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🏷️ Fixing category name from "Kitten Food" to "Cupcakes"...');

async function fixCategoryName() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get the current "Kitten Food" category
    const { data: kittenCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'kitten-food')
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching kitten food category:', fetchError);
      return;
    }
    
    if (!kittenCategory) {
      console.log('❌ Kitten Food category not found');
      return;
    }
    
    console.log('📋 Current category:');
    console.log(`   Name: ${kittenCategory.name}`);
    console.log(`   Slug: ${kittenCategory.slug}`);
    console.log(`   Description: ${kittenCategory.description}`);
    
    // Update the category to "Cupcakes"
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update({
        name: 'Cupcakes',
        slug: 'cupcakes',
        description: 'Delicious cupcakes for cats - perfect for special occasions and treats'
      })
      .eq('id', kittenCategory.id)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating category:', updateError);
      return;
    }
    
    console.log('\n✅ Category updated successfully:');
    console.log(`   New Name: ${updatedCategory[0].name}`);
    console.log(`   New Slug: ${updatedCategory[0].slug}`);
    console.log(`   New Description: ${updatedCategory[0].description}`);
    
    // Verify the update
    const { data: verifyCategory, error: verifyError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', kittenCategory.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
    } else {
      console.log('\n🔍 Verification successful:');
      console.log(`   Name: ${verifyCategory.name}`);
      console.log(`   Slug: ${verifyCategory.slug}`);
    }
    
  } catch (error) {
    console.error('❌ Fix error:', error.message);
  }
}

fixCategoryName();
