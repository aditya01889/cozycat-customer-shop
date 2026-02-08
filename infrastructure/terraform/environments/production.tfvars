# =============================================================================
# Production Environment Configuration
# Free Tier Optimized
# =============================================================================

# Environment identifier
environment = "production"

# Project configurations
project_name = "cozycat"

# Supabase settings (Free Tier)
supabase_region = "us-east-1"
supabase_db_size_mb = 500

# Vercel settings (Free Tier)
vercel_framework = "nextjs"

# Redis settings (Free Tier)
redis_region = "global"
redis_eviction_policy = "allkeys_lru"

# Application settings
node_env = "production"
debug_mode = false
log_level = "error"

# Feature flags
enable_analytics = true
enable_monitoring = true
enable_debug_endpoints = false
