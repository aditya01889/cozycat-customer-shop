#!/usr/bin/env node

// Set production DATABASE_URL
process.env.DATABASE_URL = 'postgresql://postgres:xfnbhheapralprcwjvzl@aws-0-us-west-1.pooler.supabase.com:6543/postgres';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE';

console.log('🔗 Production DATABASE_URL set:', process.env.DATABASE_URL);
console.log('🌐 Production SUPABASE_URL set:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Import and run the advanced performance test
const advancedTest = require('./analyze-performance.js');

// Set command line arguments to trigger the test
process.argv[2] = 'audit';

// Call the main function directly
const mainFunction = advancedTest.__esModule ? advancedTest.default.main : advancedTest.main;
if (mainFunction) {
  mainFunction();
} else {
  console.log('❌ Could not find main function in analyze-performance.js');
}
