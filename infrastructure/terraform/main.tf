# =============================================================================
# CozyCatKitchen Infrastructure as Code
# Free Tier Optimized Multi-Environment Setup
# =============================================================================

# -----------------------------------------------------------------------------
# Provider Configuration
# -----------------------------------------------------------------------------
provider "supabase" {
  # Supabase provider will use environment variables
  # SUPABASE_ACCESS_TOKEN
}

provider "vercel" {
  # Vercel provider will use environment variables
  # VERCEL_TOKEN
  # VERCEL_ORG_ID
}

provider "upstash" {
  # Upstash provider will use environment variables
  # UPSTASH_EMAIL
  # UPSTASH_API_KEY
}

# -----------------------------------------------------------------------------
# Local Variables for Environment Management
# -----------------------------------------------------------------------------
locals {
  environment = terraform.workspace
  project_name = "cozycat"
  
  # Environment-specific configurations
  config = {
    production = {
      supabase_name = "${local.project_name}-prod"
      vercel_name  = "${local.project_name}-production"
      redis_prefix = "prod"
      node_env     = "production"
    }
    staging = {
      supabase_name = "${local.project_name}-staging"
      vercel_name  = "${local.project_name}-staging"
      redis_prefix = "staging"
      node_env     = "staging"
    }
    local = {
      supabase_name = "${local.project_name}-local"
      vercel_name  = "${local.project_name}-local"
      redis_prefix = "local"
      node_env     = "development"
    }
  }
  
  current_config = local.config[local.environment]
}

# -----------------------------------------------------------------------------
# Supabase Projects (Free Tier - 2 projects max)
# -----------------------------------------------------------------------------
resource "supabase_project" "main" {
  # Skip creation for local workspace (use existing local setup)
  count = local.environment == "local" ? 0 : 1
  
  name        = local.current_config.supabase_name
  database_password = random_password.db_password.result
  region      = "us-east-1"  # Free tier region
  
  # Free tier constraints
  db_size_mb  = 500  # Free tier limit
  plan        = "free"
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# -----------------------------------------------------------------------------
# Vercel Projects (Free Tier - 1 project, use previews for staging)
# -----------------------------------------------------------------------------
resource "vercel_project" "main" {
  count = local.environment == "production" ? 1 : 0
  
  name      = local.current_config.vercel_name
  framework = "nextjs"
  
  # Environment variables for production
  environment = {
    NODE_ENV = local.current_config.node_env
    NEXT_PUBLIC_SUPABASE_URL = supabase_project.main[0].rest_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = supabase_project.main[0].anon_key
    SUPABASE_SERVICE_ROLE_KEY = supabase_project.main[0].service_role_key
    REDIS_PREFIX = local.current_config.redis_prefix
  }
  
  # Build configuration
  build_command = "npm run build"
  output_directory = ".next"
  
  # Free tier configuration
  framework = "nextjs"
  build_command = "npm run build"
  output_directory = ".next"
}

# -----------------------------------------------------------------------------
# Upstash Redis (Free Tier - 1 instance, use prefixes)
# -----------------------------------------------------------------------------
resource "upstash_redis_database" "main" {
  count = local.environment == "production" ? 1 : 0
  
  name        = "${local.project_name}-redis"
  region      = "global"
  eviction_policy = "allkeys_lru"
  
  # Free tier constraints
  region = "global"
}

# -----------------------------------------------------------------------------
# Environment Outputs
# -----------------------------------------------------------------------------
output "supabase_url" {
  value = local.environment == "local" ? "http://localhost:54321" : supabase_project.main[0].rest_url
}

output "supabase_anon_key" {
  value = local.environment == "local" ? "local-anon-key" : supabase_project.main[0].anon_key
}

output "supabase_service_key" {
  value = local.environment == "local" ? "local-service-key" : supabase_project.main[0].service_role_key
}

output "vercel_url" {
  value = local.environment == "production" ? vercel_project.main[0].url : "http://localhost:3000"
}

output "redis_url" {
  value = local.environment == "production" ? upstash_redis_database.main[0].rest_url : "http://localhost:6379"
}

output "redis_token" {
  value = local.environment == "production" ? upstash_redis_database.main[0].rest_token : "local-token"
}

output "redis_prefix" {
  value = local.current_config.redis_prefix
}

output "environment" {
  value = local.environment
}
