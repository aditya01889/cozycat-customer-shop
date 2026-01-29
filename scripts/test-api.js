#!/usr/bin/env node

const https = require('https');
const http = require('http');

const environment = process.argv[2] || 'staging';

console.log(`🌐 Testing API endpoints for ${environment}...`);

const urls = {
  staging: {
    baseUrl: 'https://cozycatkitchen-staging.vercel.app',
    endpoints: [
      '/api/health',
      '/api/products',
      '/api/categories'
    ]
  }
};

const config = urls[environment];
if (!config) {
  console.error(`❌ Unknown environment: ${environment}`);
  process.exit(1);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI() {
  const results = [];

  try {
    console.log(`🔗 Testing API at ${config.baseUrl}`);

    for (const endpoint of config.endpoints) {
      const fullUrl = `${config.baseUrl}${endpoint}`;
      console.log(`📡 Testing: ${fullUrl}`);

      try {
        const startTime = Date.now();
        const response = await makeRequest(fullUrl);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const result = {
          endpoint,
          status: response.status,
          responseTime,
          success: response.status >= 200 && response.status < 300
        };

        results.push(result);

        if (result.success) {
          console.log(`✅ ${endpoint} - ${response.status} (${responseTime}ms)`);
        } else {
          console.log(`❌ ${endpoint} - ${response.status} (${responseTime}ms)`);
        }

      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
        results.push({
          endpoint,
          status: 0,
          responseTime: 0,
          success: false,
          error: error.message
        });
      }
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const avgResponseTime = results
      .filter(r => r.responseTime > 0)
      .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime > 0).length;

    console.log(`\n📊 API Test Summary for ${environment}:`);
    console.log(`   Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);

    if (successCount === totalCount) {
      console.log(`🎉 All API tests passed for ${environment}!`);
      process.exit(0);
    } else {
      console.log(`⚠️  Some API tests failed for ${environment}`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`❌ API testing failed for ${environment}:`, error);
    process.exit(1);
  }
}

testAPI();
