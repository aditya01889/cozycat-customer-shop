# =============================================================================
# Workspace Configuration for Multi-Environment Management
# =============================================================================

# Production Workspace
resource "tfe_workspace" "production" {
  count = 0  # Disabled for free tier - using local state
  
  name         = "cozycat-production"
  organization = "your-org"
  execution_mode = "remote"
}

# Staging Workspace  
resource "tfe_workspace" "staging" {
  count = 0  # Disabled for free tier - using local state
  
  name         = "cozycat-staging"
  organization = "your-org"
  execution_mode = "remote"
}

# Local Workspace Configuration
# Using local state files for free tier
locals {
  workspace_configs = {
    production = {
      state_file = "./states/production.tfstate"
      vars_file = "./environments/production.tfvars"
    }
    staging = {
      state_file = "./states/staging.tfstate"
      vars_file = "./environments/staging.tfvars"
    }
    local = {
      state_file = "./states/local.tfstate"
      vars_file = "./environments/local.tfvars"
    }
  }
}
