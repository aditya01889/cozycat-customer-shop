# GitHub Secrets Setup for Vercel Deployment

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:
https://github.com/aditya01889/cozycat-customer-shop/settings/secrets/actions

### 1. Get Vercel Token
```bash
# Run this locally to get your Vercel token
vercel login
vercel whoami
# Then go to Vercel Dashboard → Settings → Tokens to create a token
```

### 2. Add these secrets to GitHub:

#### **VERCEL_TOKEN**
- Get from: Vercel Dashboard → Settings → Tokens → Create Token
- Value: Your Vercel personal access token

#### **VERCEL_ORG_ID**
- Value: `team_FOYgZRADH0UCR3CFoH9epquJ`

#### **VERCEL_PROJECT_ID**
- Value: `prj_AdV9FAL1imqxiBh0ouHRbU28gN4S`

### 3. Verification
After adding secrets, the GitHub Actions deployment should work correctly.

## Current Status
✅ Project linked correctly: `cozycat-customer-shop`
✅ Environment variables exist in Vercel
✅ GitHub Actions workflow updated
❌ Missing GitHub secrets (need to be added)
