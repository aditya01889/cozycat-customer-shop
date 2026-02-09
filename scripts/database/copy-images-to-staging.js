const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Production client
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoYGVhcHJhbHByY3dqdmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ5NTEwMiwiZXhwIjoyMDUyMDcxMTAyfQ.Qh3kPw6k2y_t5p2HJGD1sA1Vz5Q3G2M4S8Z9JkXmW8'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function copyImagesToStaging() {
  console.log('🚀 Starting image copy from production to staging...');
  
  try {
    // Step 1: Get all products from staging
    console.log('📦 Fetching products from staging...');
    const { data: products, error: productsError } = await stagingSupabase
      .from('products')
      .select('id, name, image_url');
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    console.log(`📋 Found ${products.length} products in staging`);
    
    // Step 2: For each product, download from production and upload to staging
    let copiedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      if (!product.image_url) {
        console.log(`⚠️  Product ${product.name} has no image URL`);
        continue;
      }
      
      // Extract filename from URL
      const urlParts = product.image_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      console.log(`🔄 Processing: ${product.name} -> ${filename}`);
      
      try {
        // Step 3: Download from production
        console.log(`⬇️  Downloading from production...`);
        const { data: fileData, error: downloadError } = await prodSupabase.storage
          .from('product-images')
          .download(`product-images/${filename}`);
        
        if (downloadError) {
          console.error(`❌ Download error for ${filename}:`, downloadError.message);
          errorCount++;
          continue;
        }
        
        // Step 4: Upload to staging
        console.log(`⬆️  Uploading to staging...`);
        const { error: uploadError } = await stagingSupabase.storage
          .from('product-images')
          .upload(`product-images/${filename}`, fileData, {
            contentType: filename.endsWith('.png') ? 'image/png' : 'image/webp',
            upsert: true
          });
        
        if (uploadError) {
          console.error(`❌ Upload error for ${filename}:`, uploadError.message);
          errorCount++;
          continue;
        }
        
        // Step 5: Update product URL in staging database
        const newImageUrl = `https://pjckafjhzwegtyhlatus.supabase.co/storage/v1/object/public/product-images/product-images/${filename}`;
        
        const { error: updateError } = await stagingSupabase
          .from('products')
          .update({ image_url: newImageUrl })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`❌ Update error for ${product.name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ Successfully copied and updated: ${product.name}`);
          copiedCount++;
        }
        
      } catch (processError) {
        console.error(`❌ Processing error for ${product.name}:`, processError.message);
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Copy complete!`);
    console.log(`✅ Successfully copied: ${copiedCount} images`);
    console.log(`❌ Errors: ${errorCount} images`);
    
    // Step 6: Verify staging storage
    console.log('\n🔍 Verifying staging storage...');
    const { data: stagingFiles } = await stagingSupabase.storage
      .from('product-images')
      .list();
    
    console.log(`📁 Staging storage now has ${stagingFiles?.length || 0} files`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the copy
copyImagesToStaging();
