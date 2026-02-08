# =============================================================================
# Staging Environment Configuration
# Updated with your actual staging Supabase credentials
# =============================================================================

# Environment identifier
environment = "staging"

# Project configurations
project_name = "cozycat"

# Supabase settings (Your staging project)
supabase_url = "https://pjckafjhzwegtyhlatus.supabase.co"
supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU"
supabase_service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM"
supabase_region = "us-east-1"
supabase_db_size_mb = 500

# Redis settings (shared with production)
redis_url = "https://evident-pug-37349.upstash.io"
redis_token = "AZHlAAIncDFkNGEwZjM5YzgzMjA0NWE2YjBlOTQ0M2Q5ZDgzNDRhOXAxMzczNDk"
redis_prefix = "staging"
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

# Vercel settings
vercel_framework = "nextjs"
vercel_url = "https://staging.cozycat.vercel.app"
