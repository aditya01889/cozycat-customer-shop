#!/usr/bin/env node

// Set production DATABASE_URL
process.env.DATABASE_URL = 'postgresql://postgres:xfnbhheapralprcwjvzl@aws-0-us-west-1.pooler.supabase.com:6543/postgres';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE';

const { createClient } = require('@supabase/supabase-js');

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

async function analyzeRealPerformance() {
  log('🔍 Real Performance Analysis', 'blue');
  log('============================', 'blue');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test actual tables that exist
    const actualTables = ['vendor_orders', 'vendor_order_items', 'subscriptions', 'production_batch_number_seq'];
    
    log('📊 Testing actual database tables...', 'cyan');
    
    const results = [];
    
    for (const tableName of actualTables) {
      log(`📋 Testing ${tableName} table...`, 'cyan');
      
      const startTime = Date.now();
      
      try {
        // Test count query
        const { data: countData, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });
        
        const countTime = Date.now() - startTime;
        
        // Test sample data query
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(10);
        
        const sampleTime = Date.now() - startTime;
        
        if (countError || sampleError) {
          log(`   ❌ Query failed: ${countError?.message || sampleError?.message}`, 'red');
          results.push({
            table: tableName,
            operation: 'count',
            status: 'ERROR',
            time: 0,
            error: countError?.message || sampleError?.message
          });
        } else {
          log(`   ✅ Count: ${countData?.[0]?.count || 0} records`, 'green');
          log(`   ⏱️ Count time: ${countTime}ms`, countTime < 100 ? 'green' : 'yellow');
          log(`   ✅ Sample: ${sampleData?.length || 0} records`, 'green');
          log(`   ⏱️ Sample time: ${sampleTime}ms`, sampleTime < 200 ? 'green' : 'yellow');
          
          const avgTime = (countTime + sampleTime) / 2;
          const status = avgTime < 150 ? 'GOOD' : avgTime < 300 ? 'FAIR' : 'POOR';
          
          results.push({
            table: tableName,
            operation: 'query_test',
            status: status,
            count: countData?.[0]?.count || 0,
            sampleSize: sampleData?.length || 0,
            countTime: countTime,
            sampleTime: sampleTime,
            avgTime: avgTime,
            performance: status
          });
        }
        
      } catch (error) {
        log(`   💥 Table test failed: ${error.message}`, 'red');
        results.push({
          table: tableName,
          operation: 'query_test',
          status: 'ERROR',
          error: error.message
        });
      }
    }
    
    // Calculate overall performance score
    const goodTests = results.filter(r => r.status === 'GOOD').length;
    const totalTests = results.length;
    const performanceScore = Math.round((goodTests / totalTests) * 100);
    
    log('', 'reset');
    log('📊 Real Performance Analysis Results:', 'cyan');
    log('=================================', 'cyan');
    log(`✅ Total Tables Tested: ${totalTests}`, 'blue');
    log(`✅ Good Performance: ${goodTests}/${totalTests}`, 'green');
    log(`📊 Performance Score: ${performanceScore}%`, performanceScore >= 80 ? 'green' : performanceScore >= 60 ? 'yellow' : 'red');
    
    if (performanceScore >= 80) {
      log('🎉 Database performance is EXCELLENT!', 'green');
    } else if (performanceScore >= 60) {
      log('✅ Database performance is GOOD!', 'green');
    } else {
      log('⚠️ Database performance is FAIR - needs optimization', 'yellow');
    }
    
    // Generate recommendations based on actual results
    log('', 'reset');
    log('💡 Performance Recommendations:', 'cyan');
    log('================================', 'cyan');
    
    const slowTables = results.filter(r => r.avgTime > 200);
    const largeTables = results.filter(r => r.count > 1000);
    
    if (slowTables.length > 0) {
      log('🔴 SLOW TABLES DETECTED:', 'red');
      slowTables.forEach(table => {
        log(`   - ${table.table}: ${table.avgTime}ms average`, 'red');
      });
      log('   Recommendation: Add indexes for frequently queried columns', 'blue');
    }
    
    if (largeTables.length > 0) {
      log('📊 LARGE TABLES DETECTED:', 'yellow');
      largeTables.forEach(table => {
        log(`   - ${table.table}: ${table.count} records`, 'yellow');
      });
      log('   Recommendation: Consider table partitioning for large datasets', 'blue');
    }
    
    if (performanceScore < 80) {
      log('🔧 OPTIMIZATION RECOMMENDATIONS:', 'yellow');
      log('   1. Create indexes on foreign key columns', 'blue');
      log('   2. Add composite indexes for common query patterns', 'blue');
      log('   3. Implement query result caching', 'blue');
      log('   4. Consider table partitioning for large tables', 'blue');
      log('   5. Optimize frequently used queries', 'blue');
    }
    
    return {
      score: performanceScore,
      tables: results,
      recommendations: generateRecommendations(results)
    };
    
  } catch (error) {
    log(`💥 Real performance analysis failed: ${error.message}`, 'red');
    return {
      score: 0,
      tables: [],
      error: error.message
    };
  }
}

function generateRecommendations(results) {
  const recommendations = [];
  
  // Analyze patterns in results
  const avgTimes = results.map(r => r.avgTime).filter(t => t > 0);
  const overallAvgTime = avgTimes.length > 0 ? avgTimes.reduce((sum, t) => sum + t, 0) / avgTimes.length : 0;
  
  if (overallAvgTime > 200) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Slow query performance detected',
      solution: 'Add indexes on frequently queried columns and optimize complex queries'
    });
  }
  
  const totalRecords = results.reduce((sum, r) => sum + (r.count || 0), 0);
  if (totalRecords > 10000) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Large dataset detected',
      solution: 'Consider table partitioning and implementing data archiving'
    });
  }
  
  if (results.some(r => r.status === 'ERROR')) {
    recommendations.push({
      priority: 'CRITICAL',
      issue: 'Database query errors detected',
      solution: 'Review database permissions and query syntax'
    });
  }
  
  return recommendations;
}

async function main() {
  const command = process.argv[2] || 'run';
  
  log('⚡ Real Performance Analysis Tool', 'blue');
  log('================================', 'blue');
  
  switch (command) {
    case 'run':
    case 'analyze':
      log('🚀 Running real performance analysis...', 'blue');
      log('', 'reset');
      
      const result = await analyzeRealPerformance();
      
      log('', 'reset');
      log('🎯 REAL PERFORMANCE ANALYSIS COMPLETED!', 'green');
      log('=====================================', 'green');
      log('📋 Summary:', 'cyan');
      log(`   Performance Score: ${result.score}%`, result.score >= 80 ? 'green' : result.score >= 60 ? 'yellow' : 'red');
      log(`   Tables Analyzed: ${result.tables.length}`, 'blue');
      log(`   Recommendations: ${result.recommendations.length}`, 'yellow');
      
      if (result.recommendations.length > 0) {
        log('', 'reset');
        log('💡 Performance Recommendations:', 'cyan');
        log('================================', 'cyan');
        result.recommendations.forEach((rec, index) => {
          log(`   ${index + 1}. [${rec.priority}] ${rec.issue}`, rec.priority === 'CRITICAL' ? 'red' : rec.priority === 'HIGH' ? 'yellow' : 'blue');
          log(`      Solution: ${rec.solution}`, 'blue');
        });
      }
      }
      
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node real-performance-analysis.js run  - Run real performance analysis', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeRealPerformance
};
