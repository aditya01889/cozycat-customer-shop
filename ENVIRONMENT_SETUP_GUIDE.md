# Environment Setup & Security Guide

## 📋 Your Questions Answered

### 1. **Do I really need to add env vars in GitHub if I have all env vars added in Vercel?**

**Yes, you still need minimal GitHub secrets** because:

- **CI runs before Vercel deployment**: GitHub Actions needs access to staging DB for testing
- **Separate concerns**: CI testing vs Vercel deployment
- **Minimal secrets needed**:

```bash
# Add these to GitHub Repository Secrets
STAGING_SUPABASE_URL=https://pjckafjhzwegtyhlatus.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STAGING_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Keep in Vercel:**
- All production env vars
- All staging env vars  
- Payment keys
- Email credentials
- Redis tokens

### 2. **How do I make sure local development uses .env.development?**

**Next.js Environment Priority:**
```
.env.local > .env.development > .env.staging > .env.production
```

**Setup completed:**
- ✅ `.env.local` - Now empty (only for local overrides)
- ✅ `.env.development` - Contains local Supabase config
- ✅ Local development will automatically use `.env.development`

**To verify:**
```bash
# Check which environment is being used
npm run dev
# Look for: "Environment: development"
```

### 3. **How do I implement branch protection in GitHub?**

**Go to Repository Settings > Branches:**

1. **Add branch protection rule** for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include `CI Pipeline` as required status check

2. **Add branch protection rule** for `staging`:
   - ✅ Require status checks to pass before merging
   - ✅ Include `CI Pipeline` as required status check

**Required Status Checks:**
- `CI Pipeline` (from your workflow)
- `build-validation`
- `quality-check`
- `security-scan`

### 4. **How do I enable deployment checks in Vercel?**

**In Vercel Dashboard:**

1. **Go to Project Settings > Git**
2. **Enable "GitHub Status Checks"**
3. **Add these required checks:**
   - `CI Pipeline` (from GitHub Actions)
   - `build-validation`
   - `quality-check`
   - `security-scan`

**Result:** Vercel will only deploy after GitHub Actions pass

### 5. **Can we make CI checks independent of env vars?**

**Yes, but with limitations:**

**✅ What can be done without env vars:**
- Code quality checks (ESLint, TypeScript)
- Build validation (with dummy values)
- Security scanning (dependency audit, secrets detection)
- Basic unit tests

**❌ What needs env vars:**
- Database connectivity tests
- API integration tests
- E2E tests against staging

**Recommended strategy:**
```yaml
# Split CI into env-independent and env-dependent jobs
env-independent-checks:  # Always runs
  - lint
  - type-check  
  - build
  - security-scan

env-dependent-checks:   # Only runs on staging/main
  - database-tests
  - api-tests
  - e2e-tests
```

### 6. **Do I have to add local Supabase env vars to Vercel?**

**No, keep local Supabase local only:**

**✅ Keep local:**
- Local Supabase URL (`http://localhost:54321`)
- Local Supabase keys (development keys)
- These are for your local development only

**✅ Add to Vercel:**
- Staging Supabase (for staging environment)
- Production Supabase (for production environment)
- All other services (Redis, payments, email)

**Why this separation:**
- Local development should use local resources
- Vercel deployments need cloud resources
- Prevents accidental local-to-production connections

### 7. **Is seed data aligned with production DB schema?**

**Current seed data structure:**

```javascript
// Categories
{
  id: uuid,
  name: string,
  slug: string, 
  description: string,
  image_url: string,
  is_active: boolean,
  sort_order: number
}

// Products  
{
  id: uuid,
  name: string,
  slug: string,
  category_id: uuid,
  price: number,
  original_price: number,
  image_url: string,
  images: array,
  nutritional_info: object,
  ingredients: string,
  feeding_guide: object,
  weight: string,
  packaging_type: string,
  is_active: boolean,
  is_featured: boolean,
  sort_order: number,
  stock_quantity: number,
  sku: string
}
```

**⚠️ You should verify this matches your production schema:**

```bash
# Check production schema
node scripts/check-production-schema.js

# Or manually verify in Supabase Studio
# 1. Go to production Supabase Studio
# 2. Check categories table structure
# 3. Check products table structure  
# 4. Compare with seed data structure
```

**If schema differs, update seed scripts:**
```bash
# Edit scripts/seed-database.js
# Match the exact production schema
```

## 🚀 Quick Setup Checklist

### **GitHub Setup:**
- [ ] Add 3 staging Supabase secrets to GitHub
- [ ] Enable branch protection for main/staging
- [ ] Configure required status checks

### **Vercel Setup:**
- [ ] Enable GitHub Status Checks
- [ ] Add required CI checks as deployment prerequisites
- [ ] Verify all environment variables are set

### **Local Setup:**
- [ ] `.env.local` is clean (only overrides)
- [ ] `.env.development` has local Supabase config
- [ ] Test local development: `npm run dev`

### **Schema Verification:**
- [ ] Check production schema matches seed data
- [ ] Update seed scripts if needed
- [ ] Test seeding: `npm run db:seed:local`

## 🔧 Environment File Priority

Next.js loads environment files in this order:

```
1. .env.local          (highest priority, gitignored)
2. .env.development    (development environment)
3. .env.staging        (staging environment)  
4. .env.production     (production environment)
5. .env                (shared defaults)
```

**Your setup:**
- **Local**: Uses `.env.development` (local Supabase)
- **Staging**: Uses Vercel staging env vars
- **Production**: Uses Vercel production env vars

## 🛡️ Security Best Practices

### **Environment Separation:**
- **Local**: Local resources only
- **Staging**: Staging cloud resources  
- **Production**: Production cloud resources

### **Secret Management:**
- **GitHub**: Minimal secrets for CI testing
- **Vercel**: All deployment secrets
- **Local**: Development secrets only

### **Access Control:**
- **Branch protection**: Prevents accidental pushes
- **Status checks**: Ensures quality before deployment
- **Environment isolation**: Prevents cross-environment accidents

This setup ensures secure, isolated environments with proper safeguards! 🎉
