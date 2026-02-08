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

#### **Vercel Deployment Secrets**
- **VERCEL_TOKEN**: Get from Vercel Dashboard → Settings → Tokens → Create Token
- **VERCEL_ORG_ID**: `team_FOYgZRADH0UCR3CFoH9epquJ`
- **VERCEL_PROJECT_ID**: `prj_AdV9FAL1imqxiBh0ouHRbU28gN4S`

#### **Supabase Secrets**
- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key
- **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key

#### **Payment & API Secrets**
- **NEXT_PUBLIC_RAZORPAY_KEY_ID**: Your Razorpay public key
- **RAZORPAY_KEY_SECRET**: Your Razorpay secret key
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**: Your Google Maps API key

### 3. Quick Setup - Copy from Vercel

You can get most of these values from your Vercel project:
```bash
# Run this locally to pull environment variables
vercel env pull .env.local --environment=production
# Then copy the values to GitHub secrets
```

### 4. Verification
After adding all secrets, the GitHub Actions deployment should work correctly.

## Current Status
✅ Project linked correctly: `cozycat-customer-shop`
✅ Environment variables exist in Vercel
✅ GitHub Actions workflow updated
✅ Added missing payment and API secrets
❌ GitHub secrets need to be added (you need to do this step)

## Critical Missing Variables (Causing Current Failure)
The build is failing because these are missing from GitHub Actions:
- NEXT_PUBLIC_RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET  
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
