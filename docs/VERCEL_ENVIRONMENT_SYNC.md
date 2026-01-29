# 🚀 Vercel Environment Variables Sync Guide

This guide shows you how to sync all environment variables to Vercel using CLI commands and configuration files.

## 📋 What You'll Get

### **Environment Files Created:**
- `.env.production` - Production environment variables
- `.env.staging` - Staging environment variables (NEW)
- `.env.preview` - Preview environment variables (PRs/feature branches)
- `.env.development` - Development environment variables (local)

### **Sync Scripts:**
- `scripts/sync-vercel-env.js` - Node.js version (cross-platform)
- `scripts/sync-vercel-env.sh` - Bash version (Linux/Mac)
- `scripts/sync-vercel-env.ps1` - PowerShell version (Windows)

## 🛠️ **Setup Steps**

### **Step 1: Install Vercel CLI**
```bash
# Install globally
npm i -g vercel

# Or install locally
npm install --save-dev vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Link to Your Project**
```bash
# In your project directory
vercel link --confirm
```

### **Step 4: Run Environment Sync**
Choose one of these options:

#### **Option A: Node.js (Recommended)**
```bash
npm run vercel:sync-env
```

#### **Option B: Bash (Linux/Mac)**
```bash
npm run vercel:sync-env:sh
```

#### **Option C: PowerShell (Windows)**
```bash
npm run vercel:sync-env:ps1
```

## 📁 **Environment File Structure**

### **Production (.env.production)**
```env
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://xfnbhheapralprcwjvzl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
REDIS_PREFIX=production

# URLs
SITE_URL=https://cozycatkitchen.vercel.app
```

### **Staging (.env.staging)**
```env
# Supabase Staging Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pjckafjhzwegtyhlatus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_key

# Environment
NODE_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging
REDIS_PREFIX=staging

# URLs
SITE_URL=https://staging.cozycat.vercel.app

# Test mode
NEXT_PUBLIC_PAYMENT_MODE=test
NEXT_PUBLIC_DEBUG=true
```

### **Preview (.env.preview)**
```env
# Supabase Production (use production for previews)
NEXT_PUBLIC_SUPABASE_URL=https://xfnbhheapralprcwjvzl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=preview
REDIS_PREFIX=preview

# Test mode
NEXT_PUBLIC_PAYMENT_MODE=test
```

### **Development (.env.development)**
```env
# Supabase Staging (use staging for local dev)
NEXT_PUBLIC_SUPABASE_URL=https://pjckafjhzwegtyhlatus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_key

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
REDIS_PREFIX=local

# Debug mode
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

## 🎯 **Environment Mapping**

| Environment | Vercel Target | Use Case |
|-------------|---------------|----------|
| **Production** | Production, Preview, Development | Main branch deployments |
| **Staging** | Preview | Staging branch (uses preview env) |
| **Preview** | Preview | Pull requests, feature branches |
| **Development** | Development | Local development |

## 🔄 **How Vercel Uses These Variables**

### **Branch Deployments:**
- **main branch** → Uses Production variables
- **staging branch** → Uses Staging variables (via preview environment)
- **feature branches** → Uses Preview variables
- **Pull requests** → Uses Preview variables

### **Priority Order:**
1. **Branch-specific variables** (highest)
2. **Preview variables**
3. **Production variables**
4. **Development variables** (lowest)

## 🧪 **Verification**

### **Check Environment Variables in Vercel:**
```bash
# List all variables
vercel env ls

# Pull variables to local file
vercel env pull .env.local

# Pull specific environment
vercel env pull .env.production --environment=production
```

### **Test Deployments:**
```bash
# Deploy to staging
git push origin staging

# Deploy to production
git push origin main

# Check deployment URLs
# Staging: https://staging.cozycat.vercel.app
# Production: https://cozycatkitchen.vercel.app
```

### **Test Database Connection:**
```bash
# Test staging
curl https://staging.cozycat.vercel.app/api/test-db-connection

# Test production
curl https://cozycatkitchen.vercel.app/api/test-db-connection
```

## 🔧 **Manual Management**

### **Add Individual Variables:**
```bash
# Add to production
echo "your_value" | vercel env add VARIABLE_NAME production

# Add to preview
echo "your_value" | vercel env add VARIABLE_NAME preview

# Add to development
echo "your_value" | vercel env add VARIABLE_NAME development
```

### **Remove Variables:**
```bash
vercel env remove VARIABLE_NAME production
vercel env remove VARIABLE_NAME preview
vercel env remove VARIABLE_NAME development
```

### **Update Variables:**
```bash
# Simply re-add with new value
echo "new_value" | vercel env add VARIABLE_NAME production
```

## 📊 **Environment Variable Reference**

### **Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### **Optional Variables:**
- `NODE_ENV` - Environment mode
- `NEXT_PUBLIC_ENVIRONMENT` - Public environment name
- `REDIS_PREFIX` - Redis key prefix
- `SITE_URL` - Application URL
- `NEXT_PUBLIC_PAYMENT_MODE` - Payment mode (test/live)
- `NEXT_PUBLIC_DEBUG` - Debug mode flag
- `NEXT_PUBLIC_LOG_LEVEL` - Logging level

## 🚨 **Important Notes**

### **Security:**
- Never commit `.env*` files with real secrets to version control
- Use Vercel's encrypted environment variables
- Rotate keys regularly

### **Best Practices:**
- Use different Supabase projects for staging and production
- Use test payment keys for non-production environments
- Keep staging data minimal and separate from production

### **Troubleshooting:**
- If sync fails, check Vercel CLI authentication
- Ensure you're linked to the correct project
- Use `vercel env ls` to verify variables were set

## 🎉 **Success Criteria**

After running the sync script, you should have:

✅ **All environment variables** configured in Vercel
✅ **Three separate environments** (production, preview, development)
✅ **Automatic environment detection** based on branch
✅ **Working deployments** for all environments
✅ **Database isolation** between staging and production

## 📞 **Support**

If you encounter issues:

1. **Check Vercel CLI**: `vercel --version`
2. **Check authentication**: `vercel whoami`
3. **Check project link**: `vercel ls`
4. **Review logs**: Check Vercel dashboard deployment logs

---

**🎉 Your environment variables are now managed programmatically!**
