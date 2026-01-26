# Razorpay Integration Guide

## Overview
Complete guide for Razorpay payment integration in CozyCatKitchen e-commerce system.

## Architecture

### Components Involved
- **Frontend**: `app/checkout/page.tsx` - Payment form and Razorpay modal
- **Backend**: `app/api/razorpay/create-order/route.ts` - Order creation API
- **Security**: `lib/security/csrf.ts` - CSRF protection
- **Client**: `lib/razorpay/client.ts` - Razorpay client wrapper

### Security Implementation
- **Authentication**: JWT token validation via Supabase
- **CSRF Protection**: Dual-cookie approach (HTTP-only + client-accessible)
- **Rate Limiting**: 20 requests/hour for payment endpoints
- **Input Validation**: Zod schemas for all inputs

## CSP Configuration

### Critical CSP Directives
```javascript
// In proxy.ts - Content Security Policy for Razorpay
{
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com",
  "connect-src 'self' https://xfnbhheapralprcwjvzl.supabase.co wss://xfnbhheapralprcwjvzl.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com",
  "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com"
}
```

### Required Domains
- **checkout.razorpay.com** - Main payment interface
- **api.razorpay.com** - API endpoints and iframe content
- **lumberjack.razorpay.com** - Analytics and tracking

## Payment Flow

### 1. Order Creation
```javascript
// Customer submits checkout form
// → Order saved to database
// → Razorpay order created via API
// → Payment modal opens
```

### 2. Payment Processing
```javascript
// Customer completes payment in Razorpay modal
// → Payment verified via webhook/API
// → Order status updated
// → Customer redirected to success page
```

### 3. Error Handling
- **Network errors**: Retry mechanism with exponential backoff
- **Payment failures**: Clear error messages and retry options
- **Validation errors**: Real-time form validation feedback

## Testing

### Automated CSP Test
```bash
node test-csp.js
```

### Manual Testing Checklist
- [ ] Cart items display correctly
- [ ] Form validation works
- [ ] Payment modal opens without CSP errors
- [ ] Test payment completes successfully
- [ ] Order is saved to database
- [ ] Success page loads correctly

## Troubleshooting

### Common Issues

#### 1. CSP Blocking Errors
**Symptoms**: Console shows CSP violations for Razorpay domains
**Solution**: Update CSP in `proxy.ts` to include all required domains

#### 2. 403 Forbidden Errors
**Symptoms**: API calls return 403 status
**Solution**: Check authentication token and CSRF token presence

#### 3. Payment Modal Not Loading
**Symptoms**: Razorpay modal doesn't appear
**Solution**: Verify script loading and CSP configuration

### Debug Commands
```bash
# Check CSP configuration
node test-csp.js

# Find CSP sources
node find-csp-source.js

# Test API endpoints
curl -X POST http://localhost:3000/api/razorpay/create-order
```

## Environment Variables

### Required Variables
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=https://....
SUPABASE_SERVICE_ROLE_KEY=....
```

### Security Notes
- Never expose `RAZORPAY_KEY_SECRET` to client-side
- Use test keys in development, production keys in production
- Rotate keys regularly for security

## Production Deployment

### Pre-deployment Checklist
- [ ] Update Razorpay keys to production
- [ ] Verify CSP configuration
- [ ] Test payment flow with production keys
- [ ] Set up webhook endpoints
- [ ] Configure error monitoring

### Webhook Configuration
```javascript
// Webhook endpoint for payment verification
POST /api/razorpay/webhook
```

## Monitoring

### Key Metrics
- Payment success rate
- API response times
- Error rates by type
- CSP violation reports

### Logging
- All payment attempts logged
- Error details captured for debugging
- Performance metrics tracked

## Support

### Razorpay Documentation
- [Integration Guide](https://razorpay.com/docs/payment-gateway/web-integration/standard)
- [API Reference](https://razorpay.com/docs/api)
- [Testing Guide](https://razorpay.com/docs/payment-gateway/test-card-details)

### Internal Documentation
- Security implementation guide
- API endpoint documentation
- Database schema reference

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
