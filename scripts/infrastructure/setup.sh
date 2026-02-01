#!/bin/bash

# =============================================================================
# CozyCatKitchen Infrastructure Setup Script
# Free Tier Optimized Multi-Environment Setup
# =============================================================================

set -e

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

# Default environment
ENVIRONMENT=${1:-staging}
FORCE=${2:-false}

log_info "🚀 Setting up CozyCatKitchen infrastructure..."
log_info "Environment: $ENVIRONMENT"
log_info "Force setup: $FORCE"

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed"
        log_info "Install it from: https://learn.hashicorp.com/tutorials/terraform/install-cli"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Check environment variables
check_env_vars() {
    log_info "Checking environment variables..."
    
    local required_vars=(
        "VERCEL_TOKEN"
        "VERCEL_ORG_ID"
        "VERCEL_PROJECT_ID"
        "SUPABASE_ACCESS_TOKEN"
        "UPSTASH_EMAIL"
        "UPSTASH_API_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_info "Set these variables in your shell or .env file"
        exit 1
    fi
    
    log_success "All environment variables are set"
}

# Setup Terraform workspace
setup_terraform() {
    log_info "Setting up Terraform..."
    
    cd infrastructure/terraform
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Create/select workspace
    log_info "Setting up workspace: $ENVIRONMENT"
    if terraform workspace list | grep -q "$ENVIRONMENT"; then
        terraform workspace select "$ENVIRONMENT"
        log_info "Selected existing workspace: $ENVIRONMENT"
    else
        terraform workspace new "$ENVIRONMENT"
        log_success "Created new workspace: $ENVIRONMENT"
    fi
    
    # Validate configuration
    log_info "Validating Terraform configuration..."
    terraform validate
    
    cd ../..
}

# Plan infrastructure
plan_infrastructure() {
    log_info "Planning infrastructure changes..."
    
    cd infrastructure/terraform
    
    # Plan with environment-specific variables
    terraform plan -var-file="environments/${ENVIRONMENT}.tfvars" -out="terraform.plan"
    
    cd ../..
}

# Apply infrastructure
apply_infrastructure() {
    log_info "Applying infrastructure changes..."
    
    cd infrastructure/terraform
    
    # Apply the plan
    terraform apply terraform.plan
    
    # Generate environment file
    log_info "Generating environment file..."
    cat > "../../.env.${ENVIRONMENT}.generated" << EOF
# =============================================================================
# Auto-generated environment variables for $ENVIRONMENT
# Generated on: $(date)
# =============================================================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$(terraform output -raw supabase_url)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(terraform output -raw supabase_anon_key)
SUPABASE_SERVICE_ROLE_KEY=$(terraform output -raw supabase_service_key)

# Redis Configuration
UPSTASH_REDIS_REST_URL=$(terraform output -raw redis_url)
UPSTASH_REDIS_REST_TOKEN=$(terraform output -raw redis_token)
REDIS_PREFIX=$(terraform output -raw redis_prefix)

# Environment Configuration
NODE_ENV=$ENVIRONMENT
NEXT_PUBLIC_ENVIRONMENT=$ENVIRONMENT

# Application URLs
SITE_URL=$(terraform output -raw vercel_url)
EOF

    log_success "Environment file generated: .env.${ENVIRONMENT}.generated"
    
    cd ../..
}

# Setup application dependencies
setup_application() {
    log_info "Setting up application..."
    
    # Install dependencies
    log_info "Installing npm dependencies..."
    npm ci
    
    # Validate environment
    log_info "Validating environment..."
    npm run validate-env
    
    # Build application
    log_info "Building application..."
    npm run build
    
    log_success "Application setup complete"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check if local server is running
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "Local health check passed"
    else
        log_warning "Local health check failed (server not running)"
    fi
    
    # Check Redis connection
    if node -e "
        const { envRedis } = require('./lib/cache/environment-redis');
        envRedis.get('health-test').then(() => {
            console.log('✅ Redis connection successful');
            process.exit(0);
        }).catch((err) => {
            console.log('❌ Redis connection failed:', err.message);
            process.exit(1);
        });
    " &> /dev/null; then
        log_success "Redis health check passed"
    else
        log_warning "Redis health check failed"
    fi
}

# Main execution
main() {
    echo "🎯 CozyCatKitchen Infrastructure Setup"
    echo "===================================="
    echo ""
    
    # Check if force flag is set
    if [[ "$FORCE" == "true" ]]; then
        log_warning "Force mode enabled - skipping some checks"
    else
        check_dependencies
        check_env_vars
    fi
    
    setup_terraform
    
    if [[ "$FORCE" == "true" ]]; then
        plan_infrastructure
        apply_infrastructure
    else
        # Ask user for confirmation
        log_info "Infrastructure plan created. Review the output above."
        read -p "Do you want to apply these changes? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            apply_infrastructure
        else
            log_info "Infrastructure setup cancelled"
            exit 0
        fi
    fi
    
    setup_application
    run_health_checks
    
    echo ""
    log_success "🎉 Infrastructure setup complete!"
    echo ""
    log_info "Next steps:"
    echo "1. Review generated environment file: .env.${ENVIRONMENT}.generated"
    echo "2. Copy it to .env.local for local development"
    echo "3. Add environment variables to Vercel for deployment"
    echo "4. Test the application: npm run dev"
    echo ""
    log_info "Environment URLs:"
    echo "- Local: http://localhost:3000"
    echo "- Staging: https://staging.cozycat.vercel.app"
    echo "- Production: https://cozycatkitchen.vercel.app"
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment] [force]"
        echo ""
        echo "Arguments:"
        echo "  environment  Target environment (local|staging|production)"
        echo "  force        Skip confirmation prompts (true|false)"
        echo ""
        echo "Examples:"
        echo "  $0 staging"
        echo "  $0 production true"
        echo "  $0 local false"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
