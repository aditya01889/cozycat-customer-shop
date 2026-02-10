#!/usr/bin/env node

/**
 * Check admin users in production vs staging
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Admin Users: Production vs Staging');
console.log('==============================================');

// Production client
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function checkAdminUsers() {
  try {
    console.log('\n📋 Production Admin Users:');
    console.log('==========================');
    
    const { data: prodAdmins, error: prodError } = await prodSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (prodError) {
      console.log('❌ Error getting production admins:', prodError.message);
    } else {
      console.log(`✅ Found ${prodAdmins.length} admin users in production:`);
      prodAdmins.forEach(admin => {
        console.log(`   📧 ${admin.email} | 👤 ${admin.full_name} | 🆔 ${admin.id} | 🏷️ ${admin.role}`);
      });
    }

    console.log('\n📋 Staging Admin Users:');
    console.log('=======================');
    
    const { data: stagingAdmins, error: stagingError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (stagingError) {
      console.log('❌ Error getting staging admins:', stagingError.message);
    } else {
      console.log(`✅ Found ${stagingAdmins.length} admin users in staging:`);
      stagingAdmins.forEach(admin => {
        console.log(`   📧 ${admin.email} | 👤 ${admin.full_name} | 🆔 ${admin.id} | 🏷️ ${admin.role}`);
      });
    }

    console.log('\n📋 All Production Profiles (for reference):');
    console.log('==========================================');
    
    const { data: allProdProfiles, error: allProdError } = await prodSupabase
      .from('profiles')
      .select('id, email, full_name, role');
    
    if (allProdError) {
      console.log('❌ Error getting all production profiles:', allProdError.message);
    } else {
      console.log(`✅ Found ${allProdProfiles.length} total profiles in production:`);
      allProdProfiles.forEach(profile => {
        console.log(`   📧 ${profile.email} | 👤 ${profile.full_name} | 🆔 ${profile.id} | 🏷️ ${profile.role || 'null'}`);
      });
    }

    console.log('\n📋 All Staging Profiles (for reference):');
    console.log('=======================================');
    
    const { data: allStagingProfiles, error: allStagingError } = await stagingSupabase
      .from('profiles')
      .select('id, email, full_name, role');
    
    if (allStagingError) {
      console.log('❌ Error getting all staging profiles:', allStagingError.message);
    } else {
      console.log(`✅ Found ${allStagingProfiles.length} total profiles in staging:`);
      allStagingProfiles.forEach(profile => {
        console.log(`   📧 ${profile.email} | 👤 ${profile.full_name} | 🆔 ${profile.id} | 🏷️ ${profile.role || 'null'}`);
      });
    }

    // Check if superadmin@cozycatkitchen.com exists and has admin role
    console.log('\n🔍 Specific User Check: superadmin@cozycatkitchen.com');
    console.log('==================================================');
    
    const { data: prodSuperadmin, error: prodSuperError } = await prodSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'superadmin@cozycatkitchen.com')
      .single();
    
    if (prodSuperError) {
      console.log(`❌ Production superadmin not found: ${prodSuperError.message}`);
    } else {
      console.log(`✅ Production superadmin: ${prodSuperadmin.email} | Role: ${prodSuperadmin.role} | ID: ${prodSuperadmin.id}`);
    }

    const { data: stagingSuperadmin, error: stagingSuperError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'superadmin@cozycatkitchen.com')
      .single();
    
    if (stagingSuperError) {
      console.log(`❌ Staging superadmin not found: ${stagingSuperError.message}`);
    } else {
      console.log(`✅ Staging superadmin: ${stagingSuperadmin.email} | Role: ${stagingSuperadmin.role} | ID: ${stagingSuperadmin.id}`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAdminUsers();
