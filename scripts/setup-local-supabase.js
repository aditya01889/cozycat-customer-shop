#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up local Supabase environment...');

// Check if Docker is running
try {
  execSync('docker --version', { stdio: 'inherit' });
  console.log('✅ Docker is available');
} catch (error) {
  console.error('❌ Docker is not installed or not running');
  process.exit(1);
}

// Create necessary directories
const dirs = [
  'supabase/init',
  'supabase/migrations',
  'supabase/seed'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Start Supabase services
try {
  console.log('🐳 Starting Supabase containers...');
  execSync('docker-compose up -d', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('⏳ Waiting for services to be ready...');
  setTimeout(() => {
    console.log('✅ Supabase services are starting up');
    console.log('');
    console.log('🌐 Local Supabase URLs:');
    console.log('   Studio: http://localhost:54323');
    console.log('   API:    http://localhost:54321');
    console.log('   Auth:   http://localhost:54321/auth/v1');
    console.log('   DB:     postgresql://postgres:postgres@localhost:54322/postgres');
    console.log('');
    console.log('📧 Email testing: http://localhost:54328');
    console.log('');
    console.log('🔑 Default credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: (any password works in dev mode)');
    console.log('');
    console.log('⚠️  Make sure to update your .env.development with:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6');
  }, 10000);
  
} catch (error) {
  console.error('❌ Failed to start Supabase:', error.message);
  process.exit(1);
}
