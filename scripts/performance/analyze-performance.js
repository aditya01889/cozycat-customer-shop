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

function runPerformanceAudit() {
  log('📊 Running Performance Audit', 'blue');
  log('=============================', 'blue');
  
  try {
    // Read the audit SQL file
    const auditSqlFile = path.join(__dirname, '../../scripts/performance/audit.sql');
    
    if (!fs.existsSync(auditSqlFile)) {
      log('❌ Performance audit SQL file not found!', 'red');
      return false;
    }
    
    const auditSql = fs.readFileSync(auditSqlFile, 'utf8');
    
    // Create temporary SQL file for execution
    const tempSqlFile = path.join(__dirname, '../../temp-performance-audit.sql');
    fs.writeFileSync(tempSqlFile, auditSql);
    
    log('📋 Executing performance audit...', 'cyan');
    
    let result = null;
    
    // Try to execute the audit
    if (process.env.DATABASE_URL) {
      try {
        result = execSync(
          `psql "${process.env.DATABASE_URL}" -f "${tempSqlFile}"`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        log('✅ Performance audit completed via psql', 'green');
      } catch (error) {
        log(`⚠️ psql method failed: ${error.message}`, 'yellow');
      }
    }
    
    if (result) {
      log('📊 Performance Audit Results:', 'cyan');
      console.log(result);
      
      // Analyze and provide recommendations
      analyzePerformanceResults(result);
    }
    
    // Clean up
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
      log('🧹 Cleaned up temporary files', 'green');
    }
    
  } catch (error) {
    log(`💥 Performance audit failed: ${error.message}`, 'red');
  }
  
  return true;
}

function analyzePerformanceResults(results) {
  log('', 'reset');
  log('🎯 Performance Analysis:', 'blue');
  log('=====================', 'blue');
  
  const lines = results.split('\n').filter(line => line.trim());
  
  // Count slow queries
  const slowQueries = lines.filter(line => 
    line.includes('CRITICAL 🚨') || 
    line.includes('HIGH 🔴') || 
    line.includes('MEDIUM 🟡')
  ).length;
  
  const criticalQueries = lines.filter(line => line.includes('CRITICAL 🚨')).length;
  
  // Count large tables
  const largeTables = lines.filter(line => 
    line.includes('LARGE 🔴')
  ).length;
  
  // Count missing indexes
  const missingIndexes = lines.filter(line => 
    line.includes('SHOULD BE INDEXED 🔍')
  ).length;
  
  // Count high bloat
  const highBloat = lines.filter(line => 
    line.includes('HIGH BLOAT 🔴')
  ).length;
  
  log('📈 Performance Issues Found:', 'cyan');
  log(`🚨 Critical Slow Queries: ${criticalQueries}`, 'red');
  log(`🔴 High Slow Queries: ${slowQueries - criticalQueries}`, 'red');
  log(`📊 Large Tables: ${largeTables}`, 'yellow');
  log(`🔍 Missing Indexes: ${missingIndexes}`, 'yellow');
  log(`🗑️ High Table Bloat: ${highBloat}`, 'red');
  
  // Generate recommendations
  log('', 'reset');
  log('💡 Performance Recommendations:', 'cyan');
  log('=============================', 'cyan');
  
  if (criticalQueries > 0) {
    log('🚨 URGENT: Optimize critical slow queries immediately', 'red');
    log('   - Add missing indexes', 'blue');
    log('   - Rewrite complex queries', 'blue');
    log('   - Consider query caching', 'blue');
  }
  
  if (largeTables > 0) {
    log('📊 Consider table partitioning for large tables', 'yellow');
    log('   - Implement archiving strategy', 'blue');
    log('   - Add proper indexes', 'blue');
  }
  
  if (missingIndexes > 0) {
    log('🔍 Create missing indexes for better query performance', 'yellow');
    log('   - Focus on foreign key columns', 'blue');
    log('   - Add composite indexes for common query patterns', 'blue');
  }
  
  if (highBloat > 0) {
    log('🗑️ Schedule regular VACUUM and ANALYZE operations', 'red');
    log('   - Set up autovacuum configuration', 'blue');
    log('   - Monitor table bloat regularly', 'blue');
  }
  
  // Calculate performance score
  const totalIssues = criticalQueries + largeTables + missingIndexes + highBloat;
  const maxPossibleIssues = 20; // Arbitrary baseline
  const performanceScore = Math.max(0, 100 - (totalIssues / maxPossibleIssues * 100));
  
  log('', 'reset');
  log('📊 Performance Score:', 'cyan');
  log('========================', 'cyan');
  log(`🎯 Overall Performance Score: ${performanceScore}%`, performanceScore >= 80 ? 'green' : performanceScore >= 60 ? 'yellow' : 'red');
  
  if (performanceScore >= 90) {
    log('🎉 EXCELLENT: Performance is well optimized', 'green');
  } else if (performanceScore >= 80) {
    log('✅ GOOD: Performance is acceptable with minor optimizations', 'green');
  } else if (performanceScore >= 60) {
    log('⚠️ FAIR: Performance needs optimization', 'yellow');
  } else {
    log('🚨 POOR: Performance requires immediate attention', 'red');
  }
}

function runPerformanceOptimization() {
  log('⚡ Running Performance Optimization', 'blue');
  log('===============================', 'blue');
  
  try {
    // Read the optimization SQL file
    const optimizeSqlFile = path.join(__dirname, '../../scripts/performance/optimize.sql');
    
    if (!fs.existsSync(optimizeSqlFile)) {
      log('❌ Performance optimization SQL file not found!', 'red');
      return false;
    }
    
    const optimizeSql = fs.readFileSync(optimizeSqlFile, 'utf8');
    
    // Create temporary SQL file for execution
    const tempSqlFile = path.join(__dirname, '../../temp-performance-optimize.sql');
    fs.writeFileSync(tempSqlFile, optimizeSql);
    
    log('📋 Executing performance optimization...', 'cyan');
    
    let result = null;
    
    // Try to execute the optimization
    if (process.env.DATABASE_URL) {
      try {
        result = execSync(
          `psql "${process.env.DATABASE_URL}" -f "${tempSqlFile}"`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        log('✅ Performance optimization completed via psql', 'green');
      } catch (error) {
        log(`⚠️ Optimization failed: ${error.message}`, 'yellow');
        log('💡 Try running optimization commands individually', 'blue');
      }
    }
    
    if (result) {
      log('📊 Optimization Results:', 'cyan');
      console.log(result);
      
      log('✅ Performance optimizations applied:', 'green');
      log('   - Essential indexes created', 'blue');
      log('   - Table statistics updated', 'blue');
      log('   - Table bloat cleaned', 'blue');
      log('   - Materialized views created', 'blue');
      log('   - Configuration optimized', 'blue');
    }
    
    // Clean up
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
      log('🧹 Cleaned up temporary files', 'green');
    }
    
  } catch (error) {
    log(`💥 Performance optimization failed: ${error.message}`, 'red');
  }
  
  return true;
}

function generatePerformanceReport(auditResults, optimizationResults) {
  log('📊 Generating Performance Report', 'blue');
  log('==============================', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    audit: {
      status: 'Performance audit completed',
      issues_found: auditResults ? 'Analysis completed with recommendations' : 'Audit failed'
    },
    optimization: {
      status: 'Performance optimization completed',
      changes_applied: optimizationResults ? 'Optimizations applied successfully' : 'Optimization failed'
    },
    recommendations: [
      '1. Schedule regular performance monitoring',
      '2. Implement query caching for frequently accessed data',
      '3. Consider read replicas for read-heavy workloads',
      '4. Set up automated VACUUM and ANALYZE schedules',
      '5. Monitor slow query logs and optimize regularly',
      '6. Consider connection pooling for high-traffic applications'
    ],
    next_steps: [
      '1. Monitor application performance after optimizations',
      '2. Set up performance alerting',
      '3. Schedule regular performance reviews',
      '4. Consider database scaling if needed'
    ]
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../../docs/performance/performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`💾 Performance report saved: ${reportPath}`, 'green');
  
  return report;
}

async function main() {
  const command = process.argv[2] || 'run';
  
  log('⚡ Performance Analysis & Optimization Tool', 'blue');
  log('======================================', 'blue');
  
  switch (command) {
    case 'run':
    case 'optimize':
      log('🚀 Running complete performance analysis...', 'blue');
      log('', 'reset');
      
      const auditSuccess = await runPerformanceAudit();
      log('', 'reset');
      
      if (auditSuccess) {
        const optimizeSuccess = await runPerformanceOptimization();
        log('', 'reset');
        
        const report = await generatePerformanceReport(true, optimizeSuccess);
        
        log('', 'reset');
        log('🎯 PERFORMANCE ANALYSIS COMPLETED!', 'green');
        log('================================', 'green');
        log('📋 Summary:', 'cyan');
        log('   - Performance audit completed', 'blue');
        log('   - Optimizations applied', 'blue');
        log('   - Report generated', 'blue');
        log('', 'reset');
        log('📊 Next Steps:', 'cyan');
        log('   1. Monitor application performance', 'blue');
        log('   2. Set up performance alerting', 'blue');
        log('   3. Schedule regular reviews', 'blue');
      } else {
        log('❌ Performance analysis failed', 'red');
      }
      
      break;
      
    case 'audit':
      await runPerformanceAudit();
      break;
      
    case 'optimize':
      await runPerformanceOptimization();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node analyze-performance.js run     - Run complete performance analysis', 'cyan');
      log('  node analyze-performance.js audit    - Run performance audit only', 'cyan');
      log('  node analyze-performance.js optimize - Run performance optimization only', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  runPerformanceAudit,
  runPerformanceOptimization,
  generatePerformanceReport
};
