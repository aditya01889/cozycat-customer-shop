# CI/CD Pipeline Setup Guide

This guide covers the lightweight but effective CI/CD pipeline for your CozyCatKitchen project.

## 🎯 Pipeline Goals

### **Fast & Efficient:**
- ⚡ **Build time:** < 5 minutes
- 🧪 **Test coverage:** Critical functionality only
- 🚀 **Deployment:** Automatic on main branch
- 📊 **Visibility:** Clear success/failure status

### **Quality Assurance:**
- 🔍 **Code quality:** Lint + TypeScript checks
- 🛡️ **Security:** Dependency audit + secret scanning
- 🏥 **Health checks:** API + endpoint validation
- 📱 **User journeys:** Critical path testing

---

## 🏗️ Pipeline Architecture

### **Jobs Overview:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quality Check │    │ Critical Tests  │    │ Security Scan   │
│   (2 min)       │    │   (3 min)       │    │   (1 min)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Deploy to Prod  │
                    │   (2 min)       │
                    └─────────────────┘
```

---

## ⚙️ Setup Instructions

### **Step 1: GitHub Secrets**

Add these secrets to your GitHub repository:

```bash
# Vercel Integration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Environment Variables (optional - can use Vercel directly)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 2: Get Vercel Credentials**

1. **Vercel Token:**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create new token
   - Copy token

2. **Vercel Org ID:**
   - Run: `vercel link` (if not already linked)
   - Check: `.vercel/project.json`

3. **Vercel Project ID:**
   - Same file: `.vercel/project.json`

---

## 🧪 Test Strategy

### **Critical Tests Only:**

**1. API Tests (`tests/critical/api.test.ts`)**
- ✅ Product endpoints work
- ✅ Search functionality
- ✅ Error handling
- ✅ Response validation

**2. Smoke Tests (`tests/critical/smoke.test.ts`)**
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Product tiles clickable
- ✅ Policy pages accessible
- ✅ Mobile responsive

**3. Health Checks**
- ✅ Server starts successfully
- ✅ Critical endpoints respond
- ✅ No crashes on malformed requests

---

## 🚀 Local Development

### **Quick Testing:**
```bash
# Run critical tests only
npm run test

# Run with UI
npm run test:ui

# Quick pre-commit check
npm run test:quick

# Manual health check
bash scripts/quick-test.sh
```

### **Pre-commit Hooks:**
```bash
# Install husky (if not already)
npm install husky --save-dev
npx husky install

# Pre-commit hook automatically runs:
# - ESLint
# - TypeScript check
# - Environment validation
# - Quick build test
```

---

## 📊 Pipeline Monitoring

### **Success Indicators:**
```yaml
✅ Quality Check: Lint + TypeScript passed
✅ Critical Tests: 8/8 tests passed
✅ Security Scan: No vulnerabilities found
✅ Deploy: Production deployment successful
✅ Health Check: All endpoints responding
```

### **Failure Alerts:**
```yaml
❌ Quality Check: TypeScript errors found
❌ Critical Tests: 2/8 tests failed
❌ Security Scan: High-severity vulnerabilities
❌ Deploy: Deployment failed
❌ Health Check: API not responding
```

---

## 🔧 Customization Options

### **Add More Tests:**
```typescript
// Add to tests/critical/
tests/critical/performance.test.ts
tests/critical/accessibility.test.ts
tests/critical/integration.test.ts
```

### **Adjust Timeouts:**
```yaml
# .github/workflows/ci.yml
timeout-minutes: 5  # Adjust per job
```

### **Add Environments:**
```yaml
# Staging environment
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  # Deploy to staging URL
```

---

## 📈 Performance Metrics

### **Expected Build Times:**
```
Quality Check:    1-2 minutes
Critical Tests:   2-3 minutes  
Security Scan:    30-60 seconds
Deploy:           1-2 minutes
Total:           5-8 minutes
```

### **Resource Usage:**
```
GitHub Actions:   2000 minutes/month (free)
Vercel Builds:    Unlimited (pro plan)
Test Execution:   5-10 minutes per run
```

---

## 🚨 Troubleshooting

### **Common Issues:**

**1. Build Timeout**
```bash
# Increase timeout in ci.yml
timeout-minutes: 10
```

**2. Test Failures**
```bash
# Run tests locally first
npm run test:critical

# Debug with UI
npm run test:ui
```

**3. Deployment Issues**
```bash
# Check Vercel logs
vercel logs

# Manual deploy
vercel --prod
```

**4. Environment Variables**
```bash
# Validate locally
npm run validate-env

# Check GitHub secrets
gh secret list
```

---

## 🔄 Branch Strategy

### **Recommended Workflow:**
```
main (production)
├── develop (staging)
├── feature/new-product
└── hotfix/urgent-fix
```

### **Deployment Rules:**
- **main branch:** → Production deployment
- **develop branch:** → Staging (optional)
- **feature branches:** → Preview deployments
- **pull requests:** → Run all tests

---

## 📋 Checklist Before Going Live

### **Repository Setup:**
- [ ] GitHub secrets configured
- [ ] Vercel integration working
- [ ] Branch protection rules set
- [ ] Pre-commit hooks installed

### **Testing:**
- [ ] Critical tests passing locally
- [ ] CI pipeline running successfully
- [ ] Production deployment tested
- [ ] Health checks passing

### **Monitoring:**
- [ ] GitHub Actions notifications
- [ ] Vercel deployment alerts
- [ ] Error tracking setup
- [ ] Performance monitoring

---

## 🎯 Best Practices

### **Keep It Fast:**
- ✅ Test only critical functionality
- ✅ Use caching for dependencies
- ✅ Parallelize test execution
- ✅ Optimize build process

### **Maintain Quality:**
- ✅ Strict TypeScript checking
- ✅ Comprehensive linting rules
- ✅ Security scanning
- ✅ Regular dependency updates

### **Ensure Visibility:**
- ✅ Clear pipeline status
- ✅ Detailed error messages
- ✅ Deployment notifications
- ✅ Performance metrics

---

## 🚀 Next Steps

### **Immediate:**
1. **Set up GitHub secrets**
2. **Test CI pipeline**
3. **Configure deployment**
4. **Monitor first runs**

### **Future Enhancements:**
1. **Add staging environment**
2. **Performance testing**
3. **Accessibility testing**
4. **Automated security updates**

---

**🎉 Your CozyCatKitchen now has a robust, fast CI/CD pipeline that ensures production stability while keeping development efficient!**
