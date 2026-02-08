# =============================================================================
# Vercel Environment Variables Sync Script (PowerShell)
# 
# This script syncs all environment variables to Vercel for different environments
# Usage: powershell -ExecutionPolicy Bypass -File scripts/sync-vercel-env.ps1
# =============================================================================

param(
    [switch]$Force
)

# Colors
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "🔄 $Message..." "Blue"
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

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

function Test-VercelSetup {
    Write-Step "Verifying Vercel setup"
    
    try {
        # Check if Vercel CLI is installed
        $vercelVersion = vercel --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Vercel CLI not found"
        }
        Write-Success "Vercel CLI found: $vercelVersion"
        
        # Check if logged in
        $whoami = vercel whoami 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Not logged in to Vercel"
        }
        Write-Success "Logged in as: $whoami"
        
        # Check project link
        $null = vercel link --confirm 2>$null
        Write-Success "Project linked successfully"
        
    } catch {
        Write-Error "Vercel setup verification failed:"
        Write-Error "Please ensure you are logged in to Vercel and linked to the project:"
        Write-Error "1. Run: vercel login"
        Write-Error "2. Run: vercel link"
        exit 1
    }
}

function Sync-Environment {
    param(
        [string]$EnvName,
        [string]$EnvFile
    )
    
    Write-Host ""
    Write-ColorOutput "🚀 Syncing $EnvName environment..." "Cyan"
    Write-ColorOutput "📁 File: $EnvFile" "Blue"
    
    if (-not (Test-Path $EnvFile)) {
        Write-Warning "Environment file not found: $EnvFile"
        return
    }
    
    # Read environment variables
    $envVars = @{}
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^#].*?)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes
            $value = $value -replace '^["'']|["'']$', ''
            $envVars[$key] = $value
        }
    }
    
    $varCount = $envVars.Count
    Write-ColorOutput "📊 Found $varCount environment variables" "Blue"
    
    # Determine target environments
    $targetEnvs = @()
    switch ($EnvName) {
        "production" {
            $targetEnvs = @("production", "preview", "development")
        }
        "staging" {
            $targetEnvs = @("preview") # Staging uses preview environment in Vercel
        }
        "development" {
            $targetEnvs = @("development")
        }
    }
    
    # Set each environment variable
    foreach ($key in $envVars.Keys) {
        $value = $envVars[$key]
        Write-ColorOutput "   📝 Setting $key" "Blue"
        
        foreach ($targetEnv in $targetEnvs) {
            try {
                # Use echo to pipe the value
                $null = cmd /c "echo $value | vercel env add `"$key`" $targetEnv" 2>$null
                if ($LASTEXITCODE -ne 0 -and -not $Force) {
                    Write-Warning "   Could not set $key for $targetEnv (might already exist)"
                }
            } catch {
                if (-not $Force) {
                    $errorMsg = $_.Exception.Message
                    Write-Warning "   Could not set $key for $targetEnv: $errorMsg"
                }
            }
        }
    }
}

# Main execution
function Main {
    Write-ColorOutput "🚀 Vercel Environment Variables Sync Script" "White"
    Write-ColorOutput "==========================================" "White"
    
    try {
        # Change to project directory
        Set-Location (Split-Path $PSScriptRoot)
        
        # Verify setup
        Test-VercelSetup
        
        # Sync environments
        Sync-Environment "production" ".env.production"
        Sync-Environment "staging" ".env.staging"
        Sync-Environment "development" ".env.development"
        
        Write-Host ""
        Write-Success "Environment variables sync completed!"
        Write-Host ""
        Write-ColorOutput "📋 Summary:" "Blue"
        Write-ColorOutput "   • Production variables: Production, Preview, Development environments" "Blue"
        Write-ColorOutput "   • Staging variables: Preview environment (staging branch)" "Blue"
        Write-ColorOutput "   • Development variables: Development environment only" "Blue"
        
        Write-Host ""
        Write-ColorOutput "🌐 Next steps:" "Cyan"
        Write-ColorOutput "   1. Deploy to staging: git push origin staging" "Cyan"
        Write-ColorOutput "   2. Deploy to production: git push origin main" "Cyan"
        Write-ColorOutput "   3. Check deployments at: https://vercel.com/dashboard" "Cyan"
        
    } catch {
        Write-Host ""
        Write-Error "Sync failed!"
        Write-Error "Please check the error messages above and try again."
        exit 1
    }
}

# Run the script
Main
