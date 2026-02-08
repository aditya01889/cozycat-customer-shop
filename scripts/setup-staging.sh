#!/bin/bash

# =============================================================================
# CozyCatKitchen Staging Environment Setup Script
# =============================================================================

set -e

echo "🚀 Setting up CozyCatKitchen Staging Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    if ! command -vercel &> /dev/null; then
        log_error "Vercel CLI is not installed"
        log_info "Install it with: npm i -g vercel"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Create staging branch
create_staging_branch() {
    log_info "Creating staging branch..."
    
    if git rev-parse --verify staging >/dev/null 2>&1; then
        log_warning "Staging branch already exists"
        git checkout staging
    else
        git checkout -b staging
        log_success "Created staging branch"
    fi
}

# Setup staging environment files
setup_staging_env() {
    log_info "Setting up staging environment files..."
    
    if [ ! -f ".env.staging.local" ]; then
        cp .env.staging.template .env.staging.local
        log_success "Created .env.staging.local from template"
        log_warning "Please update .env.staging.local with your staging credentials"
    else
        log_warning ".env.staging.local already exists"
    fi
}

# Create staging database seed script
create_staging_seed() {
    log_info "Creating staging database seed script..."
    
    cat > scripts/seed-staging-data.js << 'EOF'
// =============================================================================
// Staging Database Seed Script
// =============================================================================

const { createClient } = require('@supabase/supabase-js');

// Staging environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample staging data
const stagingData = {
    users: [
        {
            email: 'staging-admin@cozycatkitchen.com',
            role: 'admin',
            name: 'Staging Admin'
        },
        {
            email: 'staging-user@cozycatkitchen.com',
            role: 'user',
            name: 'Staging User'
        }
    ],
    products: [
        {
            name: 'Staging Test Product',
            description: 'A test product for staging',
            price: 99.99,
            category: 'test'
        }
    ]
};

async function seedStagingData() {
    try {
        console.log('🌱 Seeding staging database...');
        
        // Insert staging users
        for (const user of stagingData.users) {
            const { data, error } = await supabase
                .from('profiles')
                .upsert(user, { onConflict: 'email' });
            
            if (error) {
                console.error('❌ Error inserting user:', error);
            } else {
                console.log(`✅ Inserted user: ${user.email}`);
            }
        }
        
        console.log('✅ Staging database seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding staging database:', error);
        process.exit(1);
    }
}

seedStagingData();
EOF

    log_success "Created staging seed script"
}

# Create Vercel configuration for staging
create_vercel_config() {
    log_info "Creating Vercel configuration for staging..."
    
    cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hkg1", "sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "staging"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_ENVIRONMENT": "staging"
    }
  }
}
EOF

    log_success "Created vercel.json configuration"
}

# Main execution
main() {
    echo "🎯 CozyCatKitchen Staging Setup"
    echo "================================"
    
    check_dependencies
    create_staging_branch
    setup_staging_env
    create_staging_seed
    create_vercel_config
    
    echo ""
    log_success "🎉 Staging environment setup complete!"
    echo ""
    log_info "Next steps:"
    echo "1. Update .env.staging.local with your staging credentials"
    echo "2. Create a staging Supabase project"
    echo "3. Deploy to Vercel: vercel --env staging"
    echo "4. Seed staging data: node scripts/seed-staging-data.js"
    echo ""
    log_warning "Remember to:"
    echo "- Use test API keys for staging"
    echo "- Keep staging data separate from production"
    echo "- Set up proper access controls"
}

# Run main function
main "$@"
