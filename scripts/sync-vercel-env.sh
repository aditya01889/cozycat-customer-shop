#!/bin/bash

# =============================================================================
# Vercel Environment Variables Sync Script (Bash)
# 
# This script syncs all environment variables to Vercel for different environments
# Usage: bash scripts/sync-vercel-env.sh
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log() {
    echo -e "${2:-$NC}$1${NC}"
}

log_step() {
    log "🔄 $1..." "$BLUE"
}

log_success() {
    log "✅ $1" "$GREEN"
}

log_warning() {
    log "⚠️  $1" "$YELLOW"
}

log_error() {
    log "❌ $1" "$RED"
}

log_info() {
    log "ℹ️  $1" "$CYAN"
}

# Verify Vercel setup
verify_setup() {
    log_step "Verifying Vercel setup"
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not found. Please install it first:"
        log_error "npm i -g vercel"
        exit 1
    fi
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel. Please run:"
        log_error "vercel login"
        exit 1
    fi
    
    log_success "Vercel setup verified"
}

# Sync environment variables from file
sync_environment() {
    local env_name=$1
    local env_file=$2
    
    log "\n🚀 Syncing $env_name environment..." "$CYAN"
    log "📁 File: $env_file" "$BLUE"
    
    if [[ ! -f "$env_file" ]]; then
        log_warning "Environment file not found: $env_file"
        return
    fi
    
    # Count variables (excluding comments and empty lines)
    local var_count=$(grep -E '^[^#].*=' "$env_file" | wc -l)
    log "📊 Found $var_count environment variables" "$BLUE"
    
    # Read and set each variable
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes from value
        value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
        
        log "   📝 Setting $key" "$BLUE"
        
        # Determine target environments
        local target_envs=()
        case $env_name in
            "production")
                target_envs=("production" "preview" "development")
                ;;
            "staging")
                target_envs=("preview") # Staging uses preview environment in Vercel
                ;;
            "development")
                target_envs=("development")
                ;;
        esac
        
        # Set variable for each target environment
        for target_env in "${target_envs[@]}"; do
            echo "$value" | vercel env add "$key" "$target_env" 2>/dev/null || {
                log_warning "   Could not set $key for $target_env (might already exist)"
            }
        done
        
    done < <(grep -E '^[^#].*=' "$env_file")
}

# Main function
main() {
    log "🚀 Vercel Environment Variables Sync Script" "$BOLD"
    log "==========================================" "$BOLD"
    
    # Change to project directory
    cd "$(dirname "$0")/.."
    
    # Verify setup
    verify_setup
    
    # Link project if not already linked
    if ! vercel ls | grep -q "cozycat"; then
        log_step "Linking to Vercel project"
        vercel link --confirm
    fi
    
    # Sync environments
    sync_environment "production" ".env.production"
    sync_environment "staging" ".env.staging"
    sync_environment "development" ".env.development"
    
    log "\n🎉 Environment variables sync completed!" "$GREEN"
    log "\n📋 Summary:" "$BLUE"
    log "   • Production variables: Production, Preview, Development environments" "$BLUE"
    log "   • Staging variables: Preview environment (staging branch)" "$BLUE"
    log "   • Development variables: Development environment only" "$BLUE"
    
    log "\n🌐 Next steps:" "$CYAN"
    log "   1. Deploy to staging: git push origin staging" "$CYAN"
    log "   2. Deploy to production: git push origin main" "$CYAN"
    log "   3. Check deployments at: https://vercel.com/dashboard" "$CYAN"
}

# Run main function
main "$@"
