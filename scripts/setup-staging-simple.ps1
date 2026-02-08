# =============================================================================
# Simple Staging Setup Script (PowerShell)
# Minimal steps - assumes you're already in the project directory
# =============================================================================

param(
    [switch]$Force
)

# Colors
$Colors = @{
    Green = "Green"
    Blue = "Blue"
    Yellow = "Yellow"
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
    Write-ColorOutput "INFO: $Message" "Blue"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "SUCCESS: $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "WARNING: $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "ERROR: $Message" "Red"
}

Write-ColorOutput "CozyCatKitchen Simple Staging Setup" "Green"
Write-ColorOutput "=======================================" "Green"
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "infrastructure")) {
    Write-Error "Please run this script from the customer-shop directory"
    exit 1
}

# Step 1: Create staging environment file
Write-Info "Creating staging environment file..."
if (-not (Test-Path ".env.staging.local")) {
    Copy-Item ".env.staging.template" ".env.staging.local"
    Write-Success "Created .env.staging.local"
    Write-Warning "Please update .env.staging.local with your staging credentials"
} else {
    Write-Warning ".env.staging.local already exists"
}

# Step 2: Update package.json scripts (if needed)
Write-Info "Checking package.json scripts..."
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if (-not ($packageJson.scripts.PSObject.Properties.Name -contains "infra-setup")) {
    Write-Info "Adding infrastructure scripts to package.json..."
    npm pkg set scripts.infra-setup="bash scripts/infrastructure/setup.sh"
    npm pkg set scripts.infra-deploy="powershell -ExecutionPolicy Bypass -File scripts/infrastructure/deploy.ps1"
    Write-Success "Added infrastructure scripts"
} else {
    Write-Info "Infrastructure scripts already exist"
}

# Step 3: Create staging branch
Write-Info "Creating staging branch..."
try {
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -eq "staging") {
        Write-Info "Already on staging branch"
    } else {
        git checkout staging 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Info "Creating staging branch..."
            git checkout -b staging
        }
        Write-Success "Staging branch ready"
    }
} catch {
    Write-Error "Failed to manage git branches: $($_.Exception.Message)"
}

# Step 4: Install dependencies
Write-Info "Installing dependencies..."
npm ci
Write-Success "Dependencies installed"

# Step 5: Build project to verify
Write-Info "Building project..."
npm run build
Write-Success "Build successful"

Write-Host ""
Write-Success "🎉 Simple staging setup complete!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "1. Create staging Supabase project"
Write-Host "2. Update .env.staging.local with staging credentials"
Write-Host "3. Run: npm run infra-setup staging"
Write-Host "4. Push to staging branch"
Write-Host ""
Write-Info "Staging URL will be: https://staging.cozycat.vercel.app"
