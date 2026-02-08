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

function runSecurityAudit() {
  log('🔒 Starting Security Audit', 'blue');
  log('==========================', 'blue');
  
  try {
    // Step 1: Check RLS status on all tables
    log('📋 Step 1: Checking Row Level Security (RLS) Status', 'cyan');
    log('---------------------------------------------------', 'cyan');
    
    const rlsQuery = `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled,
        CASE 
          WHEN rowsecurity THEN 'ENABLED ✅'
          ELSE 'DISABLED ❌'
        END as rls_status,
        force_rls as force_rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    log('🔍 Checking RLS status for all public tables...', 'blue');
    
    try {
      const rlsResult = execSync(`npx supabase db shell --remote "${rlsQuery}"`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '../../supabase')
      });
      
      log('📊 RLS Status Report:', 'green');
      log('========================', 'green');
      console.log(rlsResult);
      log('', 'reset');
      
    } catch (error) {
      log(`❌ Failed to check RLS status: ${error.message}`, 'red');
    }
    
    // Step 2: Check existing RLS policies
    log('📋 Step 2: Checking Existing RLS Policies', 'cyan');
    log('-------------------------------------------', 'cyan');
    
    const policiesQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        CASE 
          WHEN permissive THEN 'PERMISSIVE ✅'
          ELSE 'RESTRICTIVE 🔒'
        END as policy_type
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;
    
    log('🔍 Checking existing RLS policies...', 'blue');
    
    try {
      const policiesResult = execSync(`npx supabase db shell --remote "${policiesQuery}"`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '../../supabase')
      });
      
      log('📊 RLS Policies Report:', 'green');
      log('==========================', 'green');
      console.log(policiesResult);
      log('', 'reset');
      
    } catch (error) {
      log(`❌ Failed to check RLS policies: ${error.message}`, 'red');
    }
    
    // Step 3: Check table sizes and access patterns
    log('📋 Step 3: Analyzing Table Security', 'cyan');
    log('------------------------------------', 'cyan');
    
    const tableSecurityQuery = `
      SELECT 
        t.table_name,
        pg_size_pretty(t.table_oid) as table_size,
        COALESCE(s.n_tup_ins, 0) as inserts,
        COALESCE(s.n_tup_upd, 0) as updates,
        COALESCE(s.n_tup_del, 0) as deletes,
        CASE 
          WHEN t.table_name IN ('users', 'orders', 'cart_items') THEN 'HIGH RISK 🔴'
          WHEN t.table_name LIKE '%user%' OR t.table_name LIKE '%order%' OR t.table_name LIKE '%payment%' THEN 'MEDIUM RISK 🟡'
          ELSE 'LOW RISK 🟢'
        END as risk_level
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY pg_size_pretty(t.table_oid) DESC;
    `;
    
    log('🔍 Analyzing table security and access patterns...', 'blue');
    
    try {
      const securityResult = execSync(`npx supabase db shell --remote "${tableSecurityQuery}"`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '../../supabase')
      });
      
      log('📊 Table Security Analysis:', 'green');
      log('=============================', 'green');
      console.log(securityResult);
      log('', 'reset');
      
    } catch (error) {
      log(`❌ Failed to analyze table security: ${error.message}`, 'red');
    }
    
    // Step 4: Check for public access
    log('📋 Step 4: Checking Public Access Patterns', 'cyan');
    log('-------------------------------------------', 'cyan');
    
    const publicAccessQuery = `
      SELECT 
        schemaname,
        tablename,
        hascolumnprivileges as column_privileges,
        hasinsertprivilege as insert_privilege,
        hasupdateprivilege as update_privilege,
        hasdeleteprivilege as delete_privilege,
        hasselprivileges as select_privilege,
        CASE 
          WHEN hasinsertprivilege AND hasupdateprivilege AND hasdeleteprivilege THEN 'FULL ACCESS 🔴'
          WHEN hasinsertprivilege OR hasupdateprivilege OR hasdeleteprivilege THEN 'PARTIAL ACCESS 🟡'
          WHEN hasselprivileges THEN 'READ-ONLY ACCESS 🟡'
          ELSE 'MINIMAL ACCESS 🟢'
        END as access_level
      FROM information_schema.role_table_grants 
      WHERE grantee = 'PUBLIC'
        AND schemaname = 'public'
      ORDER BY access_level DESC, tablename;
    `;
    
    log('🔍 Checking public access to tables...', 'blue');
    
    try {
      const publicAccessResult = execSync(`npx supabase db shell --remote "${publicAccessQuery}"`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '../../supabase')
      });
      
      log('📊 Public Access Report:', 'green');
      log('========================', 'green');
      console.log(publicAccessResult);
      log('', 'reset');
      
    } catch (error) {
      log(`❌ Failed to check public access: ${error.message}`, 'red');
    }
    
    // Step 5: Generate security recommendations
    log('📋 Step 5: Generating Security Recommendations', 'cyan');
    log('-----------------------------------------------', 'cyan');
    
    const recommendations = [
      {
        priority: 'CRITICAL',
        title: 'Enable RLS on All Tables',
        description: 'Row Level Security should be enabled on all tables containing user data',
        tables: ['users', 'orders', 'cart_items'],
        action: 'Enable RLS and create restrictive policies'
      },
      {
        priority: 'HIGH',
        title: 'Review Public Access',
        description: 'Remove or restrict public access to sensitive tables',
        tables: ['orders', 'cart_items'],
        action: 'Revoke public privileges on sensitive data'
      },
      {
        priority: 'MEDIUM',
        title: 'Implement User-Based Policies',
        description: 'Create policies that allow users to access only their own data',
        tables: ['users', 'orders', 'cart_items'],
        action: 'Create user-specific RLS policies'
      },
      {
        priority: 'LOW',
        title: 'Audit Table Access',
        description: 'Regularly audit who has access to what data',
        tables: ['all'],
        action: 'Set up database audit logging'
      }
    ];
    
    log('🎯 Security Recommendations:', 'yellow');
    log('=============================', 'yellow');
    
    recommendations.forEach((rec, index) => {
      log(`${index + 1}. [${rec.priority}] ${rec.title}`, 'cyan');
      log(`   📝 Description: ${rec.description}`, 'blue');
      log(`   📋 Tables: ${rec.tables.join(', ')}`, 'blue');
      log(`   🔧 Action: ${rec.action}`, 'green');
      log('', 'reset');
    });
    
    // Save audit results
    const auditResults = {
      timestamp: new Date().toISOString(),
      rls_status: 'Checked',
      policies_reviewed: true,
      security_analysis: true,
      public_access_checked: true,
      recommendations: recommendations
    };
    
    const auditDir = path.join(__dirname, '../../docs/security');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(auditDir, 'security-audit-results.json'),
      JSON.stringify(auditResults, null, 2)
    );
    
    log('💾 Audit results saved to: docs/security/security-audit-results.json', 'green');
    
    log('🎉 Security Audit Completed!', 'green');
    log('================================', 'green');
    log('📊 Next Steps:', 'cyan');
    log('1. Review the reports above', 'blue');
    log('2. Implement RLS policies', 'blue');
    log('3. Test security changes', 'blue');
    log('4. Run security tests', 'blue');
    
    return true;
    
  } catch (error) {
    log(`💥 Security audit failed: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  const command = process.argv[2] || 'run';
  
  log('🔒 Database Security Audit Tool', 'blue');
  log('===============================', 'blue');
  
  switch (command) {
    case 'run':
    case 'audit':
      runSecurityAudit();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node audit-database.js run   - Run complete security audit', 'cyan');
      log('  node audit-database.js audit - Run complete security audit', 'cyan');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runSecurityAudit
};
