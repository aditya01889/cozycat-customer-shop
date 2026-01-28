# =============================================================================
# CozyCatKitchen Infrastructure Deployment Script (PowerShell)
# Free Tier Optimized Multi-Environment Setup
# =============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$PlanOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$Destroy
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Blue"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

# Check dependencies
function Test-Dependencies {
    Write-Info "Checking dependencies..."
    
    try {
        $null = Get-Command terraform -ErrorAction Stop
        Write-Success "Terraform is installed"
    }
    catch {
        Write-Error "Terraform is not installed"
        Write-Info "Install it from: https://learn.hashicorp.com/tutorials/terraform/install-cli"
        exit 1
    }
    
    try {
        $null = Get-Command node -ErrorAction Stop
        Write-Success "Node.js is installed"
    }
    catch {
        Write-Error "Node.js is not installed"
        exit 1
    }
    
    try {
        $null = Get-Command npm -ErrorAction Stop
        Write-Success "npm is installed"
    }
    catch {
        Write-Error "npm is not installed"
        exit 1
    }
    
    Write-Success "All dependencies are installed"
}

# Check environment variables
function Test-EnvironmentVariables {
    Write-Info "Checking environment variables..."
    
    $requiredVars = @(
        "VERCEL_TOKEN",
        "VERCEL_ORG_ID", 
        "VERCEL_PROJECT_ID",
        "SUPABASE_ACCESS_TOKEN",
        "UPSTASH_EMAIL",
        "UPSTASH_API_KEY"
    )
    
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ([string]::IsNullOrEmpty((Get-Variable -Name $var -ValueOnly -ErrorAction SilentlyContinue))) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Error "Missing required environment variables:"
        foreach ($var in $missingVars) {
            Write-Host "  - $var"
        }
        Write-Info "Set these variables in your shell or .env file"
        exit 1
    }
    
    Write-Success "All environment variables are set"
}

# Setup Terraform workspace
function Initialize-Terraform {
    Write-Info "Setting up Terraform..."
    
    Set-Location "infrastructure/terraform"
    
    try {
        # Initialize Terraform
        Write-Info "Initializing Terraform..."
        terraform init
        
        # Create/select workspace
        Write-Info "Setting up workspace: $Environment"
        $workspaces = terraform workspace list
        if ($workspaces -match $Environment) {
            terraform workspace select $Environment
            Write-Info "Selected existing workspace: $Environment"
        }
        else {
            terraform workspace new $Environment
            Write-Success "Created new workspace: $Environment"
        }
        
        # Validate configuration
        Write-Info "Validating Terraform configuration..."
        terraform validate
        
        Write-Success "Terraform setup complete"
    }
    catch {
        Write-Error "Terraform setup failed: $($_.Exception.Message)"
        Set-Location "../.."
        exit 1
    }
    
    Set-Location "../.."
}

# Plan infrastructure
function Invoke-InfrastructurePlan {
    Write-Info "Planning infrastructure changes..."
    
    Set-Location "infrastructure/terraform"
    
    try {
        # Plan with environment-specific variables
        terraform plan -var-file="environments/$Environment.tfvars" -out="terraform.plan"
        Write-Success "Infrastructure plan created"
    }
    catch {
        Write-Error "Infrastructure plan failed: $($_.Exception.Message)"
        Set-Location "../.."
        exit 1
    }
    
    Set-Location "../.."
}

# Apply infrastructure
function Invoke-InfrastructureApply {
    Write-Info "Applying infrastructure changes..."
    
    Set-Location "infrastructure/terraform"
    
    try {
        # Apply the plan
        terraform apply terraform.plan
        
        # Generate environment file
        Write-Info "Generating environment file..."
        $supabaseUrl = terraform output -raw supabase_url
        $supabaseAnonKey = terraform output -raw supabase_anon_key
        $supabaseServiceKey = terraform output -raw supabase_service_key
        $redisUrl = terraform output -raw redis_url
        $redisToken = terraform output -raw redis_token
        $redisPrefix = terraform output -raw redis_prefix
        $vercelUrl = terraform output -raw vercel_url
        
        $envContent = @"
# =============================================================================
# Auto-generated environment variables for $Environment
# Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# =============================================================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey

# Redis Configuration
UPSTASH_REDIS_REST_URL=$redisUrl
UPSTASH_REDIS_REST_TOKEN=$redisToken
REDIS_PREFIX=$redisPrefix

# Environment Configuration
NODE_ENV=$Environment
NEXT_PUBLIC_ENVIRONMENT=$Environment

# Application URLs
SITE_URL=$vercelUrl
"@
        
        $envContent | Out-File -FilePath "../../.env.$Environment.generated" -Encoding UTF8
        Write-Success "Environment file generated: .env.$Environment.generated"
        
    }
    catch {
        Write-Error "Infrastructure apply failed: $($_.Exception.Message)"
        Set-Location "../.."
        exit 1
    }
    
    Set-Location "../.."
}

# Destroy infrastructure
function Invoke-InfrastructureDestroy {
    Write-Info "Destroying infrastructure..."
    
    Set-Location "infrastructure/terraform"
    
    try {
        terraform destroy -var-file="environments/$Environment.tfvars" -auto-approve
        Write-Success "Infrastructure destroyed successfully"
    }
    catch {
        Write-Error "Infrastructure destroy failed: $($_.Exception.Message)"
        Set-Location "../.."
        exit 1
    }
    
    Set-Location "../.."
}

# Setup application
function Initialize-Application {
    Write-Info "Setting up application..."
    
    try {
        # Install dependencies
        Write-Info "Installing npm dependencies..."
        npm ci
        
        # Validate environment
        Write-Info "Validating environment..."
        npm run validate-env
        
        # Build application
        Write-Info "Building application..."
        npm run build
        
        Write-Success "Application setup complete"
    }
    catch {
        Write-Error "Application setup failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run health checks
function Test-Health {
    Write-Info "Running health checks..."
    
    # Check if local server is running
    try {
        Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop | Out-Null
        Write-Success "Local health check passed"
    }
    catch {
        Write-Warning "Local health check failed (server not running)"
    }
    
    # Check Redis connection
    try {
        node -e "
            const { envRedis } = require('./lib/cache/environment-redis');
            envRedis.get('health-test').then(() => {
                console.log('✅ Redis connection successful');
                process.exit(0);
            }).catch((err) => {
                console.log('❌ Redis connection failed:', err.message);
                process.exit(1);
            });
        " 2>$null | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Redis health check passed"
        } else {
            Write-Warning "Redis health check failed"
        }
    }
    catch {
        Write-Warning "Redis health check failed"
    }
}

# Main execution
function Main {
    Write-ColorOutput "🚀 CozyCatKitchen Infrastructure Deployment" "Green"
    Write-ColorOutput "=========================================" "Green"
    Write-Host ""
    Write-Info "Environment: $Environment"
    Write-Info "Force mode: $Force"
    Write-Info "Plan only: $PlanOnly"
    Write-Info "Destroy mode: $Destroy"
    Write-Host ""
    
    if (-not $Force) {
        Test-Dependencies
        Test-EnvironmentVariables
    }
    
    Initialize-Terraform
    
    if ($Destroy) {
        if (-not $Force) {
            $confirmation = Read-Host "Are you sure you want to destroy the $Environment environment? (y/N)"
            if ($confirmation -notmatch '^[Yy]') {
                Write-Info "Destroy operation cancelled"
                exit 0
            }
        }
        Invoke-InfrastructureDestroy
        return
    }
    
    Invoke-InfrastructurePlan
    
    if ($PlanOnly) {
        Write-Info "Plan only mode - not applying changes"
        return
    }
    
    if (-not $Force) {
        $confirmation = Read-Host "Do you want to apply these changes? (y/N)"
        if ($confirmation -notmatch '^[Yy]') {
            Write-Info "Deployment cancelled"
            exit 0
        }
    }
    
    Invoke-InfrastructureApply
    Initialize-Application
    Test-Health
    
    Write-Host ""
    Write-Success "🎉 Infrastructure deployment complete!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "1. Review generated environment file: .env.$Environment.generated"
    Write-Host "2. Copy it to .env.local for local development"
    Write-Host "3. Add environment variables to Vercel for deployment"
    Write-Host "4. Test the application: npm run dev"
    Write-Host ""
    Write-Info "Environment URLs:"
    Write-Host "- Local: http://localhost:3000"
    Write-Host "- Staging: https://staging.cozycat.vercel.app"
    Write-Host "- Production: https://cozycatkitchen.vercel.app"
}

# Execute main function
try {
    Main
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}
