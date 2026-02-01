# 🚀 CozyCatKitchen Free CI/CD Infrastructure Setup Guide

## 🎯 Overview

This guide walks you through setting up a **complete professional CI/CD pipeline** for CozyCatKitchen using **100% free services**. This setup provides enterprise-grade infrastructure management without any monthly costs.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Dev     │───▶│   Staging       │───▶│  Production     │
│                 │    │                 │    │                 │
│ • Docker Compose│    │ • Preview Deploy │    │ • Main Vercel   │
│ • Local Infra   │    │ • Staging Supabase│    │ • Prod Supabase │
│ • Free Redis    │    │ • Shared Redis   │    │ • Shared Redis   │
│ • Terraform     │    │ • Terraform      │    │ • Terraform     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💰 Free Tier Services Used

| Service | Free Tier Limit | Usage | Cost |
|---------|----------------|-------|------|
| **GitHub Actions** | 2000 min/month | ~500 min | $0 |
| **Vercel Hobby** | 1 project | Main + Previews | $0 |
| **Supabase Free** | 2 projects | Prod + Staging | $0 |
| **Upstash Redis** | 10K requests/day | Shared instance | $0 |
| **Terraform** | Unlimited | Local state | $0 |
| **Total** | | | **$0/month** |

## 📋 Prerequisites

### Required Accounts
- [x] **GitHub** (already have)
- [x] **Vercel** (already have)
- [x] **Supabase** (need 1 more project)
- [x] **Upstash Redis** (already have)

### Required Tools
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Verify installation
terraform --version
```

### Required Environment Variables
```bash
# Vercel (from Vercel dashboard > Settings > Tokens)
export VERCEL_TOKEN="your_vercel_token"
export VERCEL_ORG_ID="your_org_id"
export VERCEL_PROJECT_ID="your_project_id"

# Supabase (from Supabase dashboard > Account > Tokens)
export SUPABASE_ACCESS_TOKEN="your_supabase_token"

# Upstash (from Upstash dashboard > API Keys)
export UPSTASH_EMAIL="your_upstash_email"
export UPSTASH_API_KEY="your_upstash_api_key"
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Staging Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name: `cozycat-staging`
4. Database password: Generate a strong password
5. Region: `us-east-1` (free tier)
6. Click "Create new project"

### Step 2: Setup Infrastructure
```bash
# Clone your repository
git clone your-repo-url
cd customer-shop

# Run setup script (Unix/Linux)
chmod +x scripts/infrastructure/setup.sh
./scripts/infrastructure/setup.sh staging

# Or on Windows
powershell -ExecutionPolicy Bypass -File scripts/infrastructure/deploy.ps1 -Environment staging
```

### Step 3: Deploy to Staging
```bash
# Push to develop branch
git checkout -b develop
git add .
git commit -m "Add CI/CD infrastructure"
git push origin develop

# GitHub Actions will automatically deploy to staging
```

### Step 4: Test Production Deployment
```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# GitHub Actions will automatically deploy to production
```

## 📁 Project Structure

```
customer-shop/
├── infrastructure/
│   └── terraform/
│       ├── versions.tf
│       ├── main.tf
│       ├── environments/
│       │   ├── production.tfvars
│       │   └── staging.tfvars
│       └── workspaces/
│           └── setup.tf
├── .github/
│   └── workflows/
│       ├── infrastructure.yml
│       └── deploy.yml
├── scripts/
│   └── infrastructure/
│       ├── setup.sh
│       └── deploy.ps1
├── lib/
│   ├── cache/
│   │   └── environment-redis.ts
│   └── monitoring/
│       └── health-check.ts
└── docs/
    └── FREE_CICD_SETUP_GUIDE.md
```

## 🔧 Configuration Details

### Terraform Configuration

#### Production Environment (`environments/production.tfvars`)
```hcl
environment = "production"
project_name = "cozycat"
supabase_region = "us-east-1"
supabase_db_size_mb = 500
node_env = "production"
debug_mode = false
log_level = "error"
```

#### Staging Environment (`environments/staging.tfvars`)
```hcl
environment = "staging"
project_name = "cozycat"
supabase_region = "us-east-1"
supabase_db_size_mb = 500
node_env = "staging"
debug_mode = true
log_level = "debug"
test_payment_mode = true
```

### GitHub Actions Workflows

#### Infrastructure Management (`.github/workflows/infrastructure.yml`)
- **Plan**: Reviews infrastructure changes
- **Apply**: Deploys infrastructure changes
- **Destroy**: Removes infrastructure (manual only)

#### Application Deployment (`.github/workflows/deploy.yml`)
- **Quality Checks**: ESLint, TypeScript, build
- **Security Scan**: Dependency audit, secret detection
- **Testing**: Critical, security, mobile tests
- **Deployment**: Preview, staging, production

### Environment-Specific Redis

The system uses a **single Redis instance** with environment prefixes:

```javascript
// Production keys: prod:products, prod:users, etc.
// Staging keys: staging:products, staging:users, etc.
// Local keys: local:products, local:users, etc.
```

## 🔄 Deployment Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit
3. Push to feature branch
4. **Automatic**: Preview deployment created
5. Test preview URL
6. Create pull request to `develop`

### Staging Deployment
1. Merge PR to `develop` branch
2. **Automatic**: Staging deployment
3. URL: `https://staging.cozycat.vercel.app`
4. Run integration tests
5. Verify functionality

### Production Deployment
1. Merge `develop` to `main` branch
2. **Automatic**: Production deployment
3. URL: `https://cozycatkitchen.vercel.app`
4. Health checks run automatically
5. Monitoring begins

## 🧪 Testing Strategy

### Automated Tests
```bash
# Critical functionality tests
npm run test:critical

# Security tests
npm run test:security

# Mobile responsiveness tests
npm run test:mobile

# All tests
npm run test
```

### Environment Testing
- **Preview**: Basic functionality and smoke tests
- **Staging**: Full test suite with test data
- **Production**: Health checks and monitoring

## 📊 Monitoring & Health Checks

### Health Endpoints
- **Full Health**: `/api/health` - Comprehensive system status
- **Simple Health**: `/api/health/simple` - Load balancer check

### Metrics Tracked
- Database response time
- Redis connection status
- API response times
- Memory usage
- Error rates
- Uptime

### Environment-Specific Thresholds
| Metric | Local | Staging | Production |
|--------|-------|---------|------------|
| API Response Time | 1000ms | 2000ms | 1000ms |
| Memory Usage | 90% | 85% | 80% |
| Redis Response Time | 500ms | 1000ms | 500ms |

## 🛠️ Management Commands

### Infrastructure Management
```bash
# Setup staging environment
./scripts/infrastructure/setup.sh staging

# Setup production environment
./scripts/infrastructure/setup.sh production

# Plan infrastructure changes
cd infrastructure/terraform
terraform plan -var-file=environments/staging.tfvars

# Apply infrastructure changes
terraform apply -var-file=environments/staging.tfvars

# Destroy environment (emergency only)
terraform destroy -var-file=environments/staging.tfvars
```

### Deployment Commands
```bash
# Deploy to staging (PowerShell)
.\scripts\infrastructure\deploy.ps1 -Environment staging

# Deploy to production (PowerShell)
.\scripts\infrastructure\deploy.ps1 -Environment production

# Plan only (no deployment)
.\scripts\infrastructure\deploy.ps1 -Environment staging -PlanOnly

# Force deployment (skip confirmations)
.\scripts\infrastructure\deploy.ps1 -Environment staging -Force
```

### Environment Management
```bash
# Switch to staging workspace
cd infrastructure/terraform
terraform workspace select staging

# Switch to production workspace
terraform workspace select production

# List all workspaces
terraform workspace list
```

## 🔒 Security Best Practices

### Environment Isolation
- ✅ Separate Supabase projects for prod/staging
- ✅ Environment-specific Redis prefixes
- ✅ Different API keys for each environment
- ✅ Test payment mode in staging

### Access Control
- ✅ Production deployment requires manual approval
- ✅ Infrastructure changes require confirmation
- ✅ Environment variables stored securely
- ✅ Debug endpoints blocked in production

### Monitoring
- ✅ Health checks on all endpoints
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ Usage metrics

## 📈 Free Tier Monitoring

### GitHub Actions Usage
```bash
# Check current usage
# Go to: https://github.com/your-org/your-repo/actions/settings

# Estimated monthly usage:
# - 10 deployments × 5 minutes = 50 minutes
# - 20 test runs × 10 minutes = 200 minutes
# - Total: ~250 minutes (well under 2000 minute limit)
```

### Vercel Usage
```bash
# Check usage at: https://vercel.com/your-account/usage

# Free tier includes:
# - 100GB bandwidth/month
# - Unlimited builds (Hobby tier)
# - 1 project + unlimited previews
```

### Supabase Usage
```bash
# Check usage at: https://app.supabase.com/project/_/settings/billing

# Free tier includes:
# - 500MB database storage per project
# - 2GB bandwidth/month per project
# - 2 projects total
```

### Redis Usage
```bash
# Check usage at: https://console.upstash.com/billing

# Free tier includes:
# - 10,000 requests/day
# - 1 database
# - Global edge locations
```

## 🚨 Troubleshooting

### Common Issues

#### Terraform State Issues
```bash
# Reset Terraform state
cd infrastructure/terraform
terraform force-unlock LOCKED_WORKSPACE
terraform workspace select default
terraform workspace new staging
```

#### Environment Variable Issues
```bash
# Check environment variables
echo $VERCEL_TOKEN
echo $SUPABASE_ACCESS_TOKEN
echo $UPSTASH_API_KEY

# Set missing variables
export VERCEL_TOKEN="your_token"
```

#### Deployment Failures
```bash
# Check GitHub Actions logs
# Go to: https://github.com/your-org/your-repo/actions

# Common fixes:
# 1. Check environment variables
# 2. Verify Terraform state
# 3. Check build logs
# 4. Validate configuration
```

#### Health Check Failures
```bash
# Test health endpoint locally
curl http://localhost:3000/api/health

# Test staging health
curl https://staging.cozycat.vercel.app/api/health

# Test production health
curl https://cozycatkitchen.vercel.app/api/health
```

### Recovery Procedures

#### Database Recovery
```bash
# Restore from backup (Supabase dashboard)
# 1. Go to project settings
# 2. Click "Backups"
# 3. Select backup and restore
```

#### Deployment Rollback
```bash
# Rollback GitHub Actions deployment
# 1. Go to Actions tab
# 2. Find failed deployment
# 3. Click "Re-run jobs" with previous commit

# Or rollback to previous commit
git checkout previous-commit-hash
git push origin main
```

## 🔄 Maintenance Tasks

### Weekly
- [ ] Check free tier usage
- [ ] Review deployment logs
- [ ] Update dependencies
- [ ] Monitor performance metrics

### Monthly
- [ ] Rotate API keys
- [ ] Clean up old preview deployments
- [ ] Review Terraform state
- [ ] Update documentation

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Cost optimization review
- [ ] Architecture review

## 📚 Advanced Topics

### Manual Infrastructure Changes
```bash
# Modify Terraform configuration
cd infrastructure/terraform

# Edit main.tf or environment files
vim main.tf
vim environments/staging.tfvars

# Plan and apply changes
terraform plan -var-file=environments/staging.tfvars
terraform apply -var-file=environments/staging.tfvars
```

### Custom Environment Variables
```bash
# Add new environment variable to Terraform
# 1. Update main.tf
# 2. Add to environment tfvars files
# 3. Apply changes
# 4. Update Vercel environment variables
```

### Scaling Beyond Free Tiers
When you need to scale beyond free tiers:

1. **Vercel Pro** ($20/month)
   - Custom domains
   - Edge functions
   - Advanced analytics

2. **Supabase Pro** ($25/month)
   - More storage
   - Higher bandwidth
   - Advanced features

3. **Upstash Pro** ($5/month)
   - More requests
   - Better performance
   - Additional features

## 🎯 Success Metrics

### Deployment Metrics
- ✅ Automated deployments working
- ✅ Zero manual intervention required
- ✅ All environments healthy
- ✅ Tests passing consistently

### Performance Metrics
- ✅ Page load time < 2 seconds
- ✅ API response time < 500ms
- ✅ 99.9% uptime
- ✅ Zero security incidents

### Cost Metrics
- ✅ Total monthly cost: $0
- ✅ Free tier usage < 80%
- ✅ No surprise charges
- ✅ Scalable pricing path

## 🏆 Conclusion

You now have a **professional CI/CD pipeline** that provides:

- ✅ **Enterprise-grade infrastructure management**
- ✅ **Multi-environment support**
- ✅ **Automated testing and deployment**
- ✅ **Comprehensive monitoring**
- ✅ **Zero monthly cost**
- ✅ **Scalable architecture**

This setup rivals paid solutions while maintaining complete cost control. As your needs grow, you can easily scale to paid tiers while maintaining the same workflows and processes.

## 🆘 Support

If you encounter issues:

1. **Check logs**: GitHub Actions, Vercel, Supabase
2. **Verify configuration**: Environment variables, Terraform state
3. **Review documentation**: This guide, service docs
4. **Test locally**: Reproduce issues in development
5. **Community support**: GitHub discussions, service forums

---

**🎉 Congratulations! You now have enterprise-grade CI/CD for $0/month!**
