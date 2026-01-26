# Testing Guide for CozyCatKitchen

## Overview
This guide covers the comprehensive testing strategy for Phase 1 security validation and end-to-end automation testing to ensure production stability.

## 🚀 Quick Start

### Installation
```bash
# Install Playwright browsers
npm run test:install

# Run all tests
npm test

# Run specific test suites
npm run test:phase1    # Phase 1 security tests
npm run test:e2e       # End-to-end user journeys
npm run test:security  # All security tests
```

### Test Environment Setup
1. Ensure the application is running: `npm run dev`
2. Set environment variables:
   ```bash
   TEST_BASE_URL=http://localhost:3000
   ```
3. Run tests: `npm test`

## 📋 Test Categories

### 1. Phase 1 Security Testing
**Location**: `tests/security/phase1-security.test.ts`

#### Environment Security Tests
- ✅ Verify no sensitive data exposure in client-side code
- ✅ Validate environment variable usage
- ✅ Check for hardcoded credentials

#### API Security Tests
- ✅ Rate limiting validation
- ✅ Input sanitization and XSS prevention
- ✅ CSRF protection implementation
- ✅ Error handling without information leakage

#### Authentication Security Tests
- ✅ Session management validation
- ✅ RLS (Row Level Security) policies
- ✅ Authentication timeout handling
- ✅ API endpoint security

### 2. End-to-End User Journey Tests
**Location**: `tests/e2e/critical-user-journeys.e2e.test.ts`

#### Customer Journey Tests
- ✅ Complete purchase flow (browse → checkout → confirmation)
- ✅ User registration and profile management
- ✅ Cart functionality and order management
- ✅ Payment and shipping workflows

#### Admin Journey Tests
- ✅ Admin dashboard functionality
- ✅ Order status management
- ✅ Product management and search
- ✅ Data visualization and reporting

#### Error Handling Tests
- ✅ Network error resilience
- ✅ Session expiration handling
- ✅ Large dataset performance
- ✅ Edge case scenarios

## 🛠️ Test Configuration

### Playwright Configuration
**File**: `playwright.config.ts`

#### Key Features
- **Multi-browser testing**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: iOS Safari, Android Chrome
- **Parallel execution**: Faster test runs
- **Comprehensive reporting**: HTML, JSON, JUnit
- **Visual testing**: Screenshots and videos on failure
- **Retry logic**: CI stability

#### Environment Variables
```bash
TEST_BASE_URL=http://localhost:3000  # Test application URL
CI=true                           # CI environment flag
```

## 📊 Test Reports

### Report Generation
```bash
# Generate HTML report
npm run test:ci

# View latest report
npm run test:report
```

### Report Locations
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results.json`
- **JUnit Report**: `test-results.xml`
- **Screenshots**: `test-results/`
- **Videos**: `test-results/videos/`

## 🔧 Test Commands

### Development Testing
```bash
# Run tests in UI mode (interactive)
npm run test:ui

# Run tests with browser window (debugging)
npm run test:headed

# Debug specific test
npm run test:debug
```

### CI/CD Testing
```bash
# Run tests for CI/CD pipeline
npm run test:ci

# Run only security tests
npm run test:security

# Run only E2E tests
npm run test:e2e
```

## 🎯 Phase 1 Security Validation

### Pre-Implementation Checklist
Before running Phase 1 tests, ensure:

#### Environment Security
- [ ] All secrets moved to Vercel environment variables
- [ ] Sensitive data removed from `.env.local`
- [ ] `next.config.js` updated to use env vars
- [ ] Environment validation implemented

#### API Security
- [ ] Rate limiting middleware implemented
- [ ] Input validation schemas added
- [ ] User inputs sanitized
- [ ] CSRF protection implemented

#### Authentication Security
- [ ] RLS policies reviewed and fixed
- [ ] Proper session management implemented
- [ ] Auth timeout handling added
- [ ] API routes secured with proper auth checks

### Running Phase 1 Tests
```bash
# Run complete Phase 1 security validation
npm run test:phase1

# Detailed security test report
npm run test:security -- --reporter=html
```

### Expected Results
All Phase 1 security tests should pass with:
- ✅ No environment variable exposure
- ✅ Proper rate limiting (429 responses)
- ✅ Input validation working
- ✅ CSRF protection active
- ✅ Session management secure
- ✅ RLS policies enforced

## 🔄 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:install
      - run: npm run test:ci
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Vercel Deployment Testing
```bash
# Test staging deployment
TEST_BASE_URL=https://staging-cozycat.vercel.app npm test

# Test production deployment
TEST_BASE_URL=https://cozycat.vercel.app npm test
```

## 🐛 Debugging Tests

### Common Issues

#### 1. Application Not Running
```bash
# Start the application
npm run dev

# Check if accessible
curl http://localhost:3000
```

#### 2. Authentication Issues
```bash
# Clear test environment
npx playwright test --clear-cache

# Check test user credentials
# Verify test database state
```

#### 3. Network Timeouts
```bash
# Increase timeout in playwright.config.ts
timeout: 120000  # 2 minutes
```

### Debug Mode
```bash
# Run with debugging
npm run test:debug

# Run specific test in headed mode
npx playwright test tests/security/phase1-security.test.ts --headed
```

## 📈 Performance Testing

### Load Testing Integration
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test with artillery
artillery run load-test-config.yml
```

### Performance Metrics
- Page load time < 3 seconds
- API response time < 1 second
- Database query time < 500ms
- Memory usage < 512MB

## 🔍 Production Monitoring

### Error Tracking
- **Sentry**: JavaScript error tracking
- **LogRocket**: User session recording
- **Vercel Analytics**: Performance metrics

### Health Checks
```bash
# Application health check
curl https://cozycat.vercel.app/api/health

# Database connectivity check
curl https://cozycat.vercel.app/api/health/db
```

## 📝 Best Practices

### Test Writing
1. **Use descriptive test names**
2. **Test one thing per test**
3. **Use proper assertions**
4. **Handle async operations**
5. **Clean up after tests**

### Maintenance
1. **Update tests regularly**
2. **Review test coverage**
3. **Monitor flaky tests**
4. **Keep test data fresh**
5. **Document complex scenarios**

## 🚨 Troubleshooting

### Test Failures
1. **Check application logs**
2. **Verify test environment**
3. **Update test data**
4. **Check network connectivity**
5. **Review recent changes**

### Performance Issues
1. **Monitor resource usage**
2. **Check database queries**
3. **Review test data size**
4. **Optimize test execution**
5. **Consider test parallelization**

## 📞 Support

For testing issues:
1. Check this guide first
2. Review test logs
3. Check GitHub Issues
4. Contact development team

---

**Remember**: Testing is crucial for production stability. Run tests before every deployment and monitor results regularly.
