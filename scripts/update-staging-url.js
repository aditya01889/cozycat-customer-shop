#!/usr/bin/env node

/**
 * Update Staging Site URL Script
 * Updates the SITE_URL in .env.staging to use the new preview URL
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating Staging Site URL');
console.log('=============================');

const envPath = path.join(__dirname, '..', 'customer-shop', '.env.staging');

// Read current .env.staging
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('\n📋 Current SITE_URL:');
const siteUrlMatch = envContent.match(/SITE_URL=(.+)/);
if (siteUrlMatch) {
  console.log(`   Current: ${siteUrlMatch[1]}`);
}

// Get the new preview URL (you'll need to update this after deployment)
const newPreviewUrl = 'https://cozycat-customer-shop-n8ea3eaqt.vercel.app';

console.log(`\n📋 New Preview URL: ${newPreviewUrl}`);

// Update the SITE_URL
envContent = envContent.replace(
  /SITE_URL=.+/,
  `SITE_URL=${newPreviewUrl}`
);

// Write back to file
fs.writeFileSync(envPath, envContent);

console.log('\n✅ SITE_URL updated successfully!');
console.log('\n📋 Updated SITE_URL:');
const updatedMatch = envContent.match(/SITE_URL=(.+)/);
if (updatedMatch) {
  console.log(`   New: ${updatedMatch[1]}`);
}

console.log('\n🎯 Next Steps:');
console.log('1. Commit and push this change');
console.log('2. Trigger another deployment');
console.log('3. The app will use the new preview URL');
