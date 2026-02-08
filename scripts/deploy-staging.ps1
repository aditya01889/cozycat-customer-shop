# =============================================================================
# CozyCatKitchen Staging Deployment Script (PowerShell)
# =============================================================================

param(
    [switch]$SkipEnvCheck,
    [switch]$SkipSeed,
    [string]$Message = ""
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
        $null = Get-Command git -ErrorAction Stop
        Write-Success "Git is installed"
    }
    catch {
        Write-Error "Git is not installed"
        exit 1
    }
    
    try {
        $null = Get-Command vercel -ErrorAction Stop
        Write-Success "Vercel CLI is installed"
    }
    catch {
        Write-Error "Vercel CLI is not installed"
        Write-Info "Install it with: npm i -g vercel"
        exit 1
    }
    
    Write-Success "All dependencies are installed"
}

# Check staging environment
function Test-StagingEnvironment {
    if ($SkipEnvCheck) {
        Write-Warning "Skipping environment check"
        return
    }
    
    Write-Info "Checking staging environment..."
    
    if (-not (Test-Path ".env.staging.local")) {
        Write-Error ".env.staging.local not found"
        Write-Info "Run: cp .env.staging.template .env.staging.local"
        Write-Info "Then update .env.staging.local with your staging credentials"
        exit 1
    }
    
    # Load and validate staging environment
    $envFile = Get-Content ".env.staging.local"
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXT_PUBLIC_RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET"
    )
    
    foreach ($var in $requiredVars) {
        $found = $envFile | Where-Object { $_ -match "^$var=" }
        if (-not $found) {
            Write-Error "Missing required environment variable: $var"
            exit 1
        }
    }
    
    Write-Success "Staging environment is configured"
}

# Prepare staging branch
function Initialize-StagingBranch {
    Write-Info "Preparing staging branch..."
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -ne "staging") {
        Write-Info "Switching to staging branch..."
        git checkout staging 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Info "Creating staging branch..."
            git checkout -b staging
        }
    }
    
    # Pull latest changes
    Write-Info "Pulling latest changes..."
    git pull origin staging
    
    Write-Success "Staging branch is ready"
}

# Deploy to staging
function Deploy-Staging {
    Write-Info "Deploying to staging..."
    
    # Set staging environment variables
    $env:NODE_ENV = "staging"
    $env:NEXT_PUBLIC_ENVIRONMENT = "staging"
    
    # Deploy to Vercel
    Write-Info "Building and deploying to Vercel..."
    vercel --env staging
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployed to staging successfully"
    } else {
        Write-Error "Deployment failed"
        exit 1
    }
}

# Seed staging data
function Seed-StagingData {
    if ($SkipSeed) {
        Write-Warning "Skipping data seeding"
        return
    }
    
    Write-Info "Seeding staging database..."
    
    if (Test-Path "scripts/seed-staging-data.js") {
        node scripts/seed-staging-data.js
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Staging data seeded successfully"
        } else {
            Write-Warning "Data seeding failed (non-critical)"
        }
    } else {
        Write-Warning "Seed script not found"
    }
}

# Run staging tests
function Test-StagingDeployment {
    Write-Info "Running staging tests..."
    
    # Run critical tests
    npm run test:critical
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Staging tests passed"
    } else {
        Write-Warning "Some tests failed (check logs)"
    }
}

# Main execution
function Main {
    Write-ColorOutput "🚀 CozyCatKitchen Staging Deployment" "Green"
    Write-ColorOutput "=====================================" "Green"
    Write-Host ""
    
    try {
        Test-Dependencies
        Test-StagingEnvironment
        Initialize-StagingBranch
        Deploy-Staging
        Seed-StagingData
        Test-StagingDeployment
        
        Write-Host ""
        Write-Success "🎉 Staging deployment complete!"
        Write-Host ""
        Write-Info "Staging URL: https://cozycat-staging.vercel.app"
        Write-Info "Health check: https://cozycat-staging.vercel.app/api/health"
        Write-Host ""
        Write-Info "Next steps:"
        Write-Host "1. Test the staging deployment"
        Write-Host "2. Verify all functionality works"
        Write-Host "3. Merge to main when ready for production"
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main
