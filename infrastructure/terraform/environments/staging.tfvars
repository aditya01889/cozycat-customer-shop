# =============================================================================
# Staging Environment Configuration
# Free Tier Optimized
# =============================================================================

# Environment identifier
environment = "staging"

# Project configurations
project_name = "cozycat"

# Supabase settings (Free Tier)
supabase_region = "us-east-1"
supabase_db_size_mb = 500

# Redis settings (Shared with production, using prefixes)
redis_region = "global"
redis_eviction_policy = "allkeys_lru"

# Application settings
node_env = "staging"
debug_mode = true
log_level = "debug"

# Feature flags
enable_analytics = false
enable_monitoring = true
enable_debug_endpoints = true

# Staging-specific settings
test_payment_mode = true
test_email_mode = true
mock_external_services = true
