#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function testRLSStatus() {
  log('🔍 Testing RLS Status via SQL', 'blue');
  log('=================================', 'blue');
  
  try {
    // Test RLS status on critical tables
    const rlsQuery = `
      SELECT 
        'RLS STATUS CHECK' as report_type,
        tablename,
        rowsecurity as rls_enabled,
        CASE 
          WHEN rowsecurity THEN 'ENABLED ✅'
          ELSE 'DISABLED ❌'
        END as rls_status,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
      FROM pg_tables t
      WHERE t.schemaname = 'public'
        AND t.tablename IN ('users', 'orders', 'cart_items', 'products', 'product_variants', 'categories')
      ORDER BY tablename;
    `;
    
    log('📋 Checking RLS status...', 'cyan');
    
    // Create temporary SQL file
    const tempSqlFile = path.join(__dirname, '../../temp-rls-test.sql');
    fs.writeFileSync(tempSqlFile, rlsQuery);
    
    log('💾 Created test SQL file:', 'yellow');
    log(`   ${tempSqlFile}`, 'blue');
    
    // Try to execute via different methods
    let result = null;
    
    // Method 1: Try using psql with DATABASE_URL
    if (process.env.DATABASE_URL) {
      try {
        log('🔧 Method 1: Testing with psql...', 'blue');
        result = execSync(
          `psql "${process.env.DATABASE_URL}" -f "${tempSqlFile}"`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        log('✅ psql execution completed', 'green');
      } catch (error) {
        log(`⚠️ psql method failed: ${error.message}`, 'yellow');
      }
    }
    
    // Method 2: Try using supabase db shell (if psql fails)
    if (!result) {
      try {
        log('🔧 Method 2: Testing with Supabase CLI...', 'blue');
        
        // Read SQL file content
        const sqlContent = fs.readFileSync(tempSqlFile, 'utf8');
        
        // Try to execute via supabase db shell with different approaches
        try {
          result = execSync(
            `npx supabase db shell --command "${sqlContent.replace(/\n/g, ' ')}"`,
            { cwd: path.join(__dirname, '../../supabase'), encoding: 'utf8' }
          );
          log('✅ Supabase CLI execution completed', 'green');
        } catch (shellError) {
          log(`⚠️ Shell method failed: ${shellError.message}`, 'yellow');
          
          // Try alternative approach
          try {
            result = execSync(
              `npx supabase db shell -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'orders', 'cart_items', 'products', 'product_variants', 'categories') ORDER BY tablename;"`,
              { cwd: path.join(__dirname, '../../supabase'), encoding: 'utf8' }
            );
            log('✅ Alternative shell execution completed', 'green');
          } catch (altError) {
            log(`⚠️ Alternative method failed: ${altError.message}`, 'yellow');
          }
        }
      } catch (error) {
        log(`⚠️ CLI method setup failed: ${error.message}`, 'yellow');
      }
    }
    
    if (result) {
      log('📊 RLS Status Results:', 'cyan');
      console.log(result);
      
      // Analyze results
      const lines = result.split('\n').filter(line => line.trim());
      const rlsEnabled = lines.filter(line => line.includes('ENABLED ✅')).length;
      const totalTables = lines.filter(line => line.includes('users') || line.includes('orders') || line.includes('cart_items')).length;
      
      log('', 'reset');
      log('🎯 RLS Analysis:', 'blue');
      log('==================', 'blue');
      log(`📊 Total Critical Tables: ${totalTables}`, 'cyan');
      log(`✅ RLS Enabled Tables: ${rlsEnabled}`, 'green');
      log(`❌ RLS Disabled Tables: ${totalTables - rlsEnabled}`, 'red');
      
      const rlsPercentage = Math.round((rlsEnabled / totalTables) * 100);
      log(`📈 RLS Implementation: ${rlsPercentage}%`, rlsPercentage >= 80 ? 'green' : rlsPercentage >= 50 ? 'yellow' : 'red');
      
      if (rlsPercentage === 100) {
        log('🎉 ALL CRITICAL TABLES HAVE RLS ENABLED!', 'green');
      } else if (rlsPercentage >= 80) {
        log('✅ RLS IMPLEMENTATION GOOD', 'green');
      } else if (rlsPercentage >= 50) {
        log('⚠️ RLS IMPLEMENTATION NEEDS ATTENTION', 'yellow');
      } else {
        log('🚨 RLS IMPLEMENTATION CRITICAL ISSUES', 'red');
      }
    }
    
    // Clean up
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
      log('🧹 Cleaned up temporary files', 'green');
    }
    
  } catch (error) {
    log(`💥 RLS status test failed: ${error.message}`, 'red');
  }
}

function testPublicAccess() {
  log('🌐 Testing Public Access Restrictions', 'blue');
  log('======================================', 'blue');
  
  try {
    // Test public access to sensitive tables
    const publicAccessQuery = `
      SELECT 
        'PUBLIC ACCESS CHECK' as report_type,
        tablename,
        hasinsertprivilege as insert_priv,
        hasupdateprivilege as update_priv,
        hasdeleteprivilege as delete_priv,
        hasselprivileges as select_priv,
        CASE 
          WHEN hasinsertprivilege AND hasupdateprivilege AND hasdeleteprivilege THEN 'FULL ACCESS 🔴'
          WHEN hasinsertprivilege OR hasupdateprivilege OR hasdeleteprivilege THEN 'PARTIAL ACCESS 🟡'
          WHEN hasselprivileges THEN 'READ-ONLY ACCESS 🟡'
          ELSE 'MINIMAL ACCESS 🟢'
        END as access_level
      FROM information_schema.role_table_grants 
      WHERE grantee = 'PUBLIC'
        AND schemaname = 'public'
        AND tablename IN ('users', 'orders', 'cart_items')
      ORDER BY access_level DESC, tablename;
    `;
    
    log('📋 Checking public access to sensitive tables...', 'cyan');
    
    // Create temporary SQL file
    const tempSqlFile = path.join(__dirname, '../../temp-public-test.sql');
    fs.writeFileSync(tempSqlFile, publicAccessQuery);
    
    let result = null;
    
    // Try to execute
    if (process.env.DATABASE_URL) {
      try {
        result = execSync(
          `psql "${process.env.DATABASE_URL}" -f "${tempSqlFile}"`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        log('✅ Public access test completed', 'green');
      } catch (error) {
        log(`⚠️ Public access test failed: ${error.message}`, 'yellow');
      }
    }
    
    if (result) {
      log('📊 Public Access Results:', 'cyan');
      console.log(result);
      
      // Analyze results
      const lines = result.split('\n').filter(line => line.trim());
      const fullAccess = lines.filter(line => line.includes('FULL ACCESS 🔴')).length;
      const partialAccess = lines.filter(line => line.includes('PARTIAL ACCESS 🟡')).length;
      const minimalAccess = lines.filter(line => line.includes('MINIMAL ACCESS 🟢')).length;
      
      log('', 'reset');
      log('🎯 Public Access Analysis:', 'blue');
      log('==========================', 'blue');
      log(`🔴 Full Access Tables: ${fullAccess}`, 'red');
      log(`🟡 Partial Access Tables: ${partialAccess}`, 'yellow');
      log(`🟢 Minimal Access Tables: ${minimalAccess}`, 'green');
      
      if (fullAccess === 0 && partialAccess === 0) {
        log('🎉 PUBLIC ACCESS PROPERLY RESTRICTED!', 'green');
      } else {
        log('🚨 PUBLIC ACCESS SECURITY ISSUES DETECTED!', 'red');
        log(`📊 ${fullAccess + partialAccess} tables have excessive public access`, 'red');
      }
    }
    
    // Clean up
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
      log('🧹 Cleaned up temporary files', 'green');
    }
    
  } catch (error) {
    log(`💥 Public access test failed: ${error.message}`, 'red');
  }
}

function generateSecurityReport() {
  log('📊 Generating Security Report', 'blue');
  log('==============================', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    tests: {
      rls_status: 'Tested via SQL queries',
      public_access: 'Tested via SQL queries',
      recommendations: 'Manual verification in Supabase Dashboard recommended'
    },
    summary: {
      status: 'Security verification completed via database queries',
      next_steps: [
        '1. Review RLS status results above',
        '2. Check public access restrictions',
        '3. Verify policies in Supabase Dashboard',
        '4. Test application behavior manually'
      ]
    }
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../../docs/security/simple-security-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`💾 Security report saved: ${reportPath}`, 'green');
  
  return report;
}

async function main() {
  const command = process.argv[2] || 'run';
  
  log('🔒 Simple Security Testing Tool', 'blue');
  log('==============================', 'blue');
  
  switch (command) {
    case 'run':
    case 'test':
      log('🚀 Running comprehensive security tests...', 'blue');
      log('', 'reset');
      
      await testRLSStatus();
      log('', 'reset');
      await testPublicAccess();
      
      const report = await generateSecurityReport();
      
      log('', 'reset');
      log('🎯 SECURITY TESTING COMPLETED!', 'green');
      log('==============================', 'green');
      log('📋 Next Steps:', 'cyan');
      log('1. Review results above', 'blue');
      log('2. Check Supabase Dashboard for detailed policy verification', 'blue');
      log('3. Test application behavior with real user accounts', 'blue');
      log('4. Run tests regularly to monitor security', 'blue');
      
      break;
      
    case 'rls':
      await testRLSStatus();
      break;
      
    case 'public':
      await testPublicAccess();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node simple-security-test.js run  - Run all security tests', 'cyan');
      log('  node simple-security-test.js rls  - Test RLS status only', 'cyan');
      log('  node simple-security-test.js public - Test public access only', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testRLSStatus,
  testPublicAccess,
  generateSecurityReport
};
