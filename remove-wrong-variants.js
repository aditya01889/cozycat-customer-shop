#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🗑️ Removing incorrectly created variants...');

async function removeWrongVariants() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Remove all variants I just created (they all have weight_grams: 100 and price: 29900)
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('weight_grams', 100)
      .eq('price', 29900);
    
    if (deleteError) {
      console.error('❌ Error removing variants:', deleteError);
      return;
    }
    
    console.log('✅ Removed incorrectly created variants');
    
    // Verify removal
    const { data: remainingVariants, error: verifyError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
    } else {
      console.log(`✅ Remaining variants: ${remainingVariants?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

removeWrongVariants();
