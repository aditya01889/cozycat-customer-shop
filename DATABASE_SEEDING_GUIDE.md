# Database Seeding Guide

This guide explains how to seed your local and staging Supabase databases with test data.

## 🗄️ Database Strategy

### Three-Tier Architecture

1. **Local Supabase** - Development testing with minimal data
2. **Staging Supabase** - Integration testing with realistic data  
3. **Production Supabase** - Live data (never seeded)

## 🚀 Quick Start

### Local Development

```bash
# Start local Supabase
npm run setup:local

# Or step by step:
npm run setup:local-supabase  # Start containers
npm run seed:local            # Seed local database
npm run dev                   # Start development server
```

### Staging Environment

```bash
# Seed staging database
npm run seed:staging
```

## 📊 Data Strategy

### Local Database (Development)
- **Purpose**: Fast development, feature testing
- **Size**: Small, focused dataset
- **Data**: 3 categories, 3 products, 6 variants
- **Users**: 1 test user (test@example.com)

### Staging Database (Integration Testing)
- **Purpose**: Realistic testing, QA validation
- **Size**: Medium, comprehensive dataset
- **Data**: 4 categories, 7 products, 16 variants
- **Users**: 2 test users (customer + admin)

## 🛠️ Available Scripts

```json
{
  "seed:local": "Seed local Supabase with development data",
  "seed:staging": "Seed staging Supabase with test data",
  "setup:local": "Start local Supabase + seed database"
}
```

## 🌐 Environment Variables

### Local (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
```

### Staging (.env.staging)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-key
```

## 📋 Local Development Workflow

### 1. Setup Local Environment
```bash
# Ensure Docker is running
docker --version

# Start local Supabase
npm run setup:local

# Access Supabase Studio
open http://localhost:54323
```

### 2. Feature Development
```bash
# Create feature branch
git checkout staging
git pull origin staging
git checkout -b feature/your-feature

# Develop locally
npm run dev

# Test with local data
# Local DB: http://localhost:54321
# App: http://localhost:3000
```

### 3. Testing & Deployment
```bash
# Commit changes
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature

# Create PR in GitHub
# CI runs on staging environment
# Test staging URL: https://cozycatkitchen-staging.vercel.app
```

## 🎯 Data Content

### Categories
- Fresh Meals (Main products)
- Nutritious Broths (Hydration products)
- Healthy Treats (Training rewards)
- Celebration Cakes (Special occasions - staging only)

### Products

#### Local Database
- Chicken & Rice Delight
- Salmon & Sweet Potato  
- Bone Broth Chicken

#### Staging Database
- All local products PLUS:
- Turkey & Vegetable Medley
- Salmon Broth
- Salmon Training Treats
- Birthday Tuna Cake

### Test Users

#### Local
- **test@example.com** (customer)
  - Password: Any (dev mode)

#### Staging
- **staging-test@example.com** (customer)
- **admin@staging.com** (admin)

## 🔄 Resetting Databases

### Local Database
```bash
# Reset local Supabase
cd supabase
supabase stop
supabase start

# Re-seed
npm run seed:local
```

### Staging Database
```bash
# Re-seed staging (careful - overwrites data)
npm run seed:staging
```

## 🚨 Important Notes

### Production Safety
- **NEVER** run seeding scripts on production
- Production data is preserved and never overwritten
- Always verify environment before running scripts

### Environment Detection
Scripts automatically detect environment:
- Local: Uses `.env.local`
- Staging: Uses `.env.staging`
- Production: Scripts will refuse to run

### Data Relationships
- Categories → Products (many-to-one)
- Products → Variants (one-to-many)
- Users → Profiles → Customers (one-to-one)

## 🛠️ Troubleshooting

### Local Supabase Won't Start
```bash
# Check Docker
docker --version
docker ps

# Reset Docker containers
docker-compose down
docker-compose up -d
```

### Seeding Fails
```bash
# Check environment variables
cat .env.local
cat .env.staging

# Check Supabase connection
curl http://localhost:54321/rest/v1/
```

### Permission Errors
```bash
# Ensure service role key has proper permissions
# Check Supabase Studio > Settings > API
```

## 📚 Additional Resources

- [Local Development Setup Guide](./LOCAL_DEVELOPMENT_SETUP.md)
- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md)
- [Supabase Documentation](https://supabase.com/docs)

## 🎉 Success Indicators

### Local Setup Success
- ✅ Supabase containers running
- ✅ Database seeded with test data
- ✅ App loads at http://localhost:3000
- ✅ Products display correctly

### Staging Setup Success
- ✅ Staging database seeded
- ✅ Staging site loads products
- ✅ Test users can login
- ✅ All features work correctly

---

**Happy coding! 🐾**
