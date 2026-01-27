# Redis Caching Setup Guide

This guide will help you set up free Redis caching for your CozyCatKitchen project using Upstash Redis.

## 🚀 Why Redis Caching?

**Performance Benefits:**
- ⚡ **10x faster** API responses
- 📊 **Reduced database load** (fewer queries)
- 💰 **Lower Supabase costs** (less bandwidth)
- 🌍 **Better user experience** (instant page loads)

**Free Tier Benefits:**
- 🆓 **256MB storage** (plenty for your needs)
- 🔄 **500K commands/month** (generous limit)
- 🌐 **Global edge locations** (fast worldwide)
- 📈 **Pay-per-request** after free tier

## 📋 Step 1: Create Upstash Redis Account

1. **Sign Up**: Go to [https://upstash.com](https://upstash.com)
2. **Create Free Account**: Sign up with GitHub/Google
3. **Create Database**: 
   - Click "Create Database"
   - Choose region closest to your users
   - Select "Free" plan
   - Name it: `cozycatkitchen-cache`

## 🔧 Step 2: Get Redis Credentials

1. **Go to Dashboard**: Click on your database
2. **Get REST URL**: Copy the "REST URL"
3. **Get REST Token**: Copy the "REST Token"

Example credentials:
```
REST URL: https://your-redis-url.upstash.io
REST Token: your-secret-token-here
```

## ⚙️ Step 3: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-secret-token-here
```

## 🏗️ Step 4: Install Dependencies

```bash
npm install @upstash/redis
```

## 🧪 Step 5: Test the Setup

1. **Build the project**:
```bash
npm run build
npm run start
```

2. **Test cached endpoints**:
```bash
# Test cached products
curl "http://localhost:3000/api/products/redis"

# Test cached analytics  
curl "http://localhost:3000/api/admin/analytics/cached"
```

## 📊 Step 6: Monitor Cache Performance

### Cache Hit Rates
- **Products**: 1 hour TTL
- **Search**: 15 minutes TTL  
- **Analytics**: 30 minutes TTL
- **User Profiles**: 5 minutes TTL

### Expected Performance
- **First request**: ~200ms (database + cache)
- **Cached requests**: ~20ms (cache only)
- **Cache hit rate**: 80-90% typical

## 🎯 Step 7: Update Your Components

### Replace API Calls

**Before:**
```typescript
const response = await fetch('/api/products')
```

**After:**
```typescript
const response = await fetch('/api/products/redis')
```

### Use React Hooks

```typescript
import { useCachedProducts } from '@/hooks/useRedisCache'

function ProductsPage() {
  const { data, loading, error, cached, refetch } = useCachedProducts({
    category: 'meals',
    limit: 20
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <p>Products: {data?.products?.length}</p>
      {cached && <span className="text-green-600">⚡ Cached</span>}
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

## 🔍 Step 8: Cache Management

### Clear Cache Programmatically

```typescript
// Clear all products cache
await fetch('/api/products/redis', { method: 'DELETE' })

// Clear specific pattern
await fetch('/api/admin/cache/clear?pattern=products:*', { method: 'DELETE' })
```

### Admin Dashboard Integration

Add the `CacheManager` component to your admin dashboard:

```typescript
import CacheManager from '@/components/admin/CacheManager'

function AdminDashboard() {
  return (
    <div>
      {/* Other admin components */}
      <CacheManager />
    </div>
  )
}
```

## 📈 Step 9: Monitor Usage

### Upstash Dashboard
- Monitor command usage
- Check memory usage
- View performance metrics

### Free Tier Limits
- **256MB storage** → ~10,000 cached products
- **500K commands** → ~16K daily requests
- **Bandwidth**: Unlimited on free tier

## 🚨 Troubleshooting

### Common Issues

**1. Connection Error**
```bash
Error: UPSTASH_REDIS_REST_URL not found
```
**Solution**: Check your `.env.local` file

**2. Cache Not Working**
```bash
Error: Redis connection failed
```
**Solution**: Verify REST URL and token

**3. High Memory Usage**
```bash
Warning: Approaching memory limit
```
**Solution**: Clear cache or reduce TTL

### Debug Mode

Add logging to debug cache issues:

```typescript
// In lib/redis/cache.ts
console.log('Cache GET:', key)
console.log('Cache SET:', key, ttl)
console.log('Cache MISS:', key)
```

## 🎉 Success Metrics

### Before Caching
- API response time: 200-500ms
- Database queries: 100+ per minute
- Page load time: 2-3 seconds

### After Caching  
- API response time: 20-50ms
- Database queries: 10-20 per minute
- Page load time: 0.5-1 second

## 🔄 Next Steps

1. **Monitor performance** for first week
2. **Adjust TTL values** based on usage
3. **Add more cached endpoints** as needed
4. **Upgrade to paid plan** if limits exceeded

## 💡 Pro Tips

- **Cache invalidation**: Clear cache after product updates
- **Warm cache**: Pre-populate cache with popular items
- **Compression**: Use JSON compression for large objects
- **Monitoring**: Set up alerts for cache hit rates

## 🆘 Support

- **Upstash Docs**: https://upstash.com/docs
- **Redis Documentation**: https://redis.io/docs
- **Community**: https://github.com/upstash/upstash-redis

---

**🎯 Your CozyCatKitchen is now ready for lightning-fast performance!**
