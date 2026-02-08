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

async function testDatabasePerformance() {
  log('🔗 Testing Database Performance via Supabase Client', 'blue');
  log('==============================================', 'blue');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    log('📋 Testing database queries...', 'cyan');
    
    const tests = [
      {
        name: 'Products Count Query',
        query: () => supabase.from('products').select('id', { count: 'exact' }),
        description: 'Count total products'
      },
      {
        name: 'Orders Query', 
        query: () => supabase.from('orders').select('id, total_amount, created_at').eq('user_id', 'test-user-id').limit(10),
        description: 'Query user orders'
      },
      {
        name: 'Cart Items Query',
        query: () => supabase.from('cart_items').select('id, quantity, price').eq('user_id', 'test-user-id').limit(5),
        description: 'Query user cart items'
      },
      {
        name: 'Products with Categories',
        query: () => supabase.from('products').select('id, name, categories!inner(*)').limit(20),
        description: 'Complex join query'
      }
    ];
    
    const results = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      log(`📋 Test ${i + 1}: ${test.name}`, 'cyan');
      log(`   ${test.description}`, 'blue');
      
      const startTime = Date.now();
      
      try {
        const { data, error } = await test.query();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (error) {
          log(`   ❌ Error: ${error.message}`, 'red');
          results.push({
            test: test.name,
            status: 'ERROR',
            duration: duration,
            error: error.message
          });
        } else {
          log(`   ⏱️ Time: ${duration}ms`, duration < 100 ? 'green' : duration < 200 ? 'yellow' : 'red');
          log(`   📊 Records: ${data?.length || 0}`, 'blue');
          
          const performance = duration < 100 ? 'GOOD' : duration < 200 ? 'FAIR' : 'POOR';
          results.push({
            test: test.name,
            status: performance,
            duration: duration,
            records: data?.length || 0
          });
        }
      } catch (err) {
        log(`   💥 Exception: ${err.message}`, 'red');
        results.push({
          test: test.name,
          status: 'ERROR',
          duration: 0,
          error: err.message
        });
      }
    }
    
    // Calculate performance score
    const goodTests = results.filter(r => r.status === 'GOOD').length;
    const totalTests = results.length;
    const performanceScore = Math.round((goodTests / totalTests) * 100);
    
    log('', 'reset');
    log('📊 Database Performance Summary:', 'cyan');
    log('==============================', 'cyan');
    log(`✅ Total Tests: ${totalTests}`, 'blue');
    log(`✅ Good Performance: ${goodTests}`, 'green');
    log(`📊 Performance Score: ${performanceScore}%`, performanceScore >= 80 ? 'green' : performanceScore >= 60 ? 'yellow' : 'red');
    
    if (performanceScore >= 80) {
      log('🎉 Database performance is EXCELLENT!', 'green');
    } else if (performanceScore >= 60) {
      log('✅ Database performance is GOOD!', 'green');
    } else if (performanceScore >= 40) {
      log('⚠️ Database performance is FAIR - needs optimization', 'yellow');
    } else {
      log('🚨 Database performance is POOR - requires immediate attention', 'red');
    }
    
    return {
      score: performanceScore,
      tests: results,
      recommendations: generateRecommendations(results)
    };
    
  } catch (error) {
    log(`💥 Database performance test failed: ${error.message}`, 'red');
    return {
      score: 0,
      tests: [],
      error: error.message
    };
  }
}

function generateRecommendations(testResults) {
  const recommendations = [];
  
  const slowTests = testResults.filter(t => t.duration > 200);
  const errorTests = testResults.filter(t => t.status === 'ERROR');
  
  if (slowTests.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Slow database queries detected',
      solution: 'Add indexes for frequently queried columns',
      affected_tests: slowTests.map(t => t.test)
    });
  }
  
  if (errorTests.length > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      issue: 'Database query errors',
      solution: 'Check database permissions and query syntax',
      affected_tests: errorTests.map(t => t.test)
    });
  }
  
  const avgDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0) / testResults.length;
  if (avgDuration > 150) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Average query time above optimal',
      solution: 'Consider query optimization and caching',
      affected_tests: 'Overall performance'
    });
  }
  
  return recommendations;
}

async function main() {
  const command = process.argv[2] || 'run';
  
  log('⚡ Advanced Performance Testing Tool', 'blue');
  log('===================================', 'blue');
  
  switch (command) {
    case 'run':
    case 'test':
      log('🚀 Running advanced database performance test...', 'blue');
      log('', 'reset');
      
      const result = await testDatabasePerformance();
      
      log('', 'reset');
      log('🎯 ADVANCED PERFORMANCE TESTING COMPLETED!', 'green');
      log('=====================================', 'green');
      log('📋 Summary:', 'cyan');
      log(`   Performance Score: ${result.score}%`, result.score >= 60 ? 'green' : 'red');
      log(`   Tests Executed: ${result.tests.length}`, 'blue');
      log(`   Recommendations: ${result.recommendations.length}`, 'yellow');
      
      if (result.recommendations.length > 0) {
        log('', 'reset');
        log('📊 Performance Recommendations:', 'cyan');
        log('================================', 'cyan');
        result.recommendations.forEach((rec, index) => {
          log(`   ${index + 1}. [${rec.priority}] ${rec.issue}`, rec.priority === 'CRITICAL' ? 'red' : rec.priority === 'HIGH' ? 'yellow' : 'blue');
          log(`      Solution: ${rec.solution}`, 'blue');
        });
      }
      
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node run-advanced-test-fixed.js run  - Run advanced performance test', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDatabasePerformance,
  generateRecommendations
};
