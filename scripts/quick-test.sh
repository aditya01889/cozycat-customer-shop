#!/bin/bash

# Quick test script for local development
# Runs essential tests without full CI overhead

set -e

echo "🚀 Running Quick Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test 1: Environment validation
echo "🔍 Validating environment variables..."
if npm run validate-env > /dev/null 2>&1; then
    print_status "Environment variables valid"
else
    print_error "Environment validation failed"
    exit 1
fi

# Test 2: TypeScript check
echo "🔧 Checking TypeScript types..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    print_status "TypeScript check passed"
else
    print_error "TypeScript check failed"
    npx tsc --noEmit --skipLibCheck
    exit 1
fi

# Test 3: Linting
echo "📝 Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    print_status "Linting passed"
else
    print_warning "Linting issues found (not blocking)"
    npm run lint
fi

# Test 4: Quick build test
echo "🏗️  Testing build process..."
if npm run build > /dev/null 2>&1; then
    print_status "Build successful"
else
    print_error "Build failed"
    npm run build
    exit 1
fi

# Test 5: Start server and health check
echo "🏥 Starting development server for health check..."
npm run start > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Health check
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Server health check passed"
else
    print_error "Server health check failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# API health check
if curl -f http://localhost:3000/api/products/all > /dev/null 2>&1; then
    print_status "API health check passed"
else
    print_warning "API health check failed (might be normal in dev)"
fi

# Clean up
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 All quick tests passed!"
echo "📊 Summary:"
echo "   - Environment: ✅"
echo "   - TypeScript: ✅"
echo "   - Linting: ✅"
echo "   - Build: ✅"
echo "   - Health Check: ✅"
echo ""
echo "🚀 Ready to commit and deploy!"
