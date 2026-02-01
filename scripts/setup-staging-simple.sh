#!/bin/bash

# =============================================================================
# Simple Staging Setup Script
# Minimal steps - assumes you're already in the project directory
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info "🚀 CozyCatKitchen Simple Staging Setup"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "infrastructure" ]; then
    log_error "❌ Please run this script from the customer-shop directory"
    exit 1
fi

# Step 1: Create staging environment file
log_info "Creating staging environment file..."
if [ ! -f ".env.staging.local" ]; then
    cp .env.staging.template .env.staging.local
    log_success "Created .env.staging.local"
    log_warning "⚠️  Please update .env.staging.local with your staging credentials"
else
    log_warning ".env.staging.local already exists"
fi

# Step 2: Update package.json scripts (if needed)
log_info "Checking package.json scripts..."
if ! grep -q "infra:setup" package.json; then
    log_info "Adding infrastructure scripts to package.json..."
    npm pkg set scripts.infra-setup="bash scripts/infrastructure/setup.sh"
    npm pkg set scripts.infra-deploy="powershell -ExecutionPolicy Bypass -File scripts/infrastructure/deploy.ps1"
    log_success "Added infrastructure scripts"
else
    log_info "Infrastructure scripts already exist"
fi

# Step 3: Create staging branch
log_info "Creating staging branch..."
if git rev-parse --verify staging >/dev/null 2>&1; then
    log_info "Staging branch already exists"
    git checkout staging
else
    git checkout -b staging
    log_success "Created staging branch"
fi

# Step 4: Install dependencies
log_info "Installing dependencies..."
npm ci
log_success "Dependencies installed"

# Step 5: Build project to verify
log_info "Building project..."
npm run build
log_success "Build successful"

echo ""
log_success "🎉 Simple staging setup complete!"
echo ""
log_info "Next steps:"
echo "1. Create staging Supabase project"
echo "2. Update .env.staging.local with staging credentials"
echo "3. Run: npm run infra-setup staging"
echo "4. Push to staging branch"
echo ""
log_info "Staging URL will be: https://staging.cozycat.vercel.app"
