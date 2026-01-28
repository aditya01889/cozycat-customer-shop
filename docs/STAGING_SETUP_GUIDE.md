# CozyCatKitchen Staging Environment Setup Guide

## 🎯 Overview

This guide helps you set up a lean staging environment for CozyCatKitchen using free Vercel and Supabase accounts. The staging environment allows you to test changes before deploying to production.

## 🏗️ Architecture Options

### Option 1: Branch-Based Staging (Recommended)
- **Cost**: Free
- **Setup**: Separate `staging` branch
- **Deployment**: Automatic on push to staging
- **Database**: Separate Supabase project
- **Best for**: Team collaboration, feature testing

### Option 2: Preview Deployments
- **Cost**: Free
- **Setup**: Vercel Preview for each PR
- **Deployment**: Automatic per PR
- **Database**: Shared staging database
- **Best for**: Individual developers, quick testing

## 🚀 Quick Setup (Option 1)

### Step 1: Create Staging Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name: `cozycat-staging`
4. Database password: Generate a strong password
5. Region: Choose nearest to your users
6. Click "Create new project"

### Step 2: Get Staging Credentials

From your staging Supabase project:
1. Go to Settings > API
2. Copy these values:
   - Project URL
   - Anon public key
   - Service role key

### Step 3: Setup Staging Environment

```bash
# Clone and setup
git clone your-repo
cd customer-shop

# Run the setup script
./scripts/setup-staging.sh

# Or manually on Windows
powershell -ExecutionPolicy Bypass -File scripts/setup-staging.ps1
```

### Step 4: Configure Environment Variables

Edit `.env.staging.local`:

```env
# Supabase Staging
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-key

# Use test keys for payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-test-secret

# Staging URL
SITE_URL=https://cozycat-staging.vercel.app
NODE_ENV=staging
```

### Step 5: Deploy to Staging

```bash
# Deploy to staging
./scripts/deploy-staging.ps1

# Or manually
vercel --env staging
```

## 🔧 Alternative Setup (Option 2 - Preview Deployments)

### Step 1: Enable Preview Deployments

1. Go to your Vercel project
2. Go to Settings > Git
3. Enable "Preview Deployments"
4. Set "Production Branch" to `main`
5. Set "Preview Branch" to `*` (all branches)

### Step 2: Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

#### Production Environment:
- Use your production keys
- Set `NODE_ENV=production`

#### Preview/Development Environment:
- Use test/staging keys
- Set `NODE_ENV=staging`

### Step 3: Use Preview Deployments

```bash
# Create feature branch
git checkout -b feature/new-feature

# Push changes
git push origin feature/new-feature

# Vercel will automatically create a preview deployment
# Test your changes at the provided preview URL
```

## 📊 Staging vs Production Configuration

| Setting | Production | Staging |
|---------|------------|---------|
| **Database** | Production Supabase | Staging Supabase |
| **API Keys** | Live keys | Test keys |
| **Payments** | Razorpay Live | Razorpay Test |
| **Email** | Production email | Test email |
| **URL** | `cozycatkitchen.vercel.app` | `cozycat-staging.vercel.app` |
| **Debug Mode** | Disabled | Enabled |
| **Logging** | Error only | Full debug |

## 🗄️ Database Management

### Backup Production to Staging

```bash
# Export production data
supabase db dump --db-url="postgresql://user:pass@prod-url:5432/postgres" > prod-backup.sql

# Import to staging
supabase db reset --db-url="postgresql://user:pass@staging-url:5432/postgres"
supabase db push --db-url="postgresql://user:pass@staging-url:5432/postgres" prod-backup.sql
```

### Seed Staging Data

```bash
# Run staging seed script
node scripts/seed-staging-data.js

# Or use Supabase CLI
supabase db seed
```

## 🔒 Security Best Practices

### Environment Isolation
- Never use production keys in staging
- Use separate Supabase projects
- Different email accounts for staging
- Test payment gateway only

### Access Control
- Limit staging access to team members
- Use authentication for staging
- Regularly rotate staging credentials
- Monitor staging usage

### Data Protection
- Use fake/sanitized data in staging
- Never use real customer data
- Clear staging data regularly
- Use different domains

## 🧪 Testing in Staging

### Automated Tests
```bash
# Run all tests
npm run test

# Run critical tests only
npm run test:critical

# Run security tests
npm run test:security
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Cart functionality
- [ ] Checkout process (test mode)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Mobile responsiveness
- [ ] API endpoints

### Performance Testing
```bash
# Check staging health
curl https://cozycat-staging.vercel.app/api/health

# Load testing (optional)
npm install -g artillery
artillery run load-test.yml
```

## 🔄 Deployment Workflow

### Feature Development
1. Create feature branch from `main`
2. Develop and test locally
3. Push to feature branch
4. Test in preview deployment
5. Create pull request to `staging`
6. Test in staging environment
7. Merge `staging` to `main`
8. Deploy to production

### Hotfix Process
1. Create hotfix branch from `main`
2. Fix the issue
3. Test in preview deployment
4. Merge directly to `main`
5. Deploy to production
6. Backport to `staging` if needed

## 📈 Monitoring Staging

### Health Checks
- `/api/health` - Overall health status
- `/api/health/simple` - Basic status for load balancers

### Logging
- Staging logs in Vercel Dashboard
- Database logs in Supabase Dashboard
- Error tracking with detailed stack traces

### Metrics to Monitor
- Response times
- Error rates
- Database performance
- API usage
- User activity (test users)

## 🛠️ Troubleshooting

### Common Issues

#### Deployment Failures
```bash
# Check build logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

#### Database Connection Issues
```bash
# Test database connection
node scripts/test-db-connection.js

# Check Supabase status
curl https://status.supabase.com
```

#### Environment Variable Issues
```bash
# Validate environment
npm run validate-env

# Check specific variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Recovery Procedures

#### Restore Staging Database
```bash
# Reset to clean state
supabase db reset

# Restore from backup
supabase db restore backup-file
```

#### Rollback Deployment
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy previous commit
git checkout [previous-commit]
vercel --prod
```

## 💰 Cost Optimization

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, 6 builds/day
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Upstash Redis**: 10,000 requests/day

### Optimization Tips
- Use staging only during work hours
- Clear staging data regularly
- Optimize images and assets
- Monitor usage quotas
- Use CDN caching effectively

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify Supabase project status
3. Validate environment variables
4. Review this troubleshooting guide
5. Check GitHub issues for similar problems

---

**Remember**: Staging is for testing, not production data. Always use test credentials and fake data in staging!
