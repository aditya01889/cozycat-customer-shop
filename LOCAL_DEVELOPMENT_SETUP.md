# Local Development Setup Guide

## Overview

This guide will help you set up a complete local development environment for CozyCatKitchen with local Supabase, database seeding, and development tools.

## Prerequisites

- **Node.js 20+** (recommended: use `nvm use` if you have `.nvmrc`)
- **Docker & Docker Compose** (for local Supabase)
- **Git** (for version control)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd cozycat-system/customer-shop
npm install
```

### 2. Start Local Supabase

```bash
# Setup and start local Supabase
node scripts/setup-local-supabase.js

# Or manually:
docker-compose up -d
```

### 3. Seed the Database

```bash
# Check database status
node scripts/check-db-status.js local

# Seed with sample data
node scripts/seed-database.js local
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your local development environment.

## Detailed Setup

### Local Supabase Configuration

The local Supabase setup includes:

- **PostgreSQL Database**: `postgresql://postgres:postgres@localhost:54322/postgres`
- **API Gateway**: http://localhost:54321
- **Studio Dashboard**: http://localhost:54323
- **Auth Service**: http://localhost:54321/auth/v1
- **Email Testing**: http://localhost:54328

### Environment Variables

Your `.env.development` is already configured for local development:

```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Redis (shared with staging/production)
UPSTASH_REDIS_REST_URL=https://evident-pug-37349.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
REDIS_PREFIX=local
```

### Database Management

#### Check Database Status
```bash
node scripts/check-db-status.js local
```

#### Seed Database
```bash
node scripts/seed-database.js local
```

#### Reset Database
```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
node scripts/seed-database.js local
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript check

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:security    # Run security tests

# Database
node scripts/check-db-status.js [local|staging]
node scripts/seed-database.js [local|staging]

# Supabase
docker-compose up -d     # Start local Supabase
docker-compose down      # Stop local Supabase
docker-compose logs -f   # View logs
```

## Development Workflow

### 1. Daily Development

```bash
# Start your day
docker-compose up -d
npm run dev

# Check database if needed
node scripts/check-db-status.js local

# Seed if database is empty
node scripts/seed-database.js local
```

### 2. Testing Changes

```bash
# Run tests
npm run test

# Check build
npm run build

# Run E2E tests
npm run test:e2e
```

### 3. Before Committing

```bash
# Code quality checks
npm run lint
npm run type-check

# Run all tests
npm run test

# Build validation
npm run build
```

## Environment URLs

| Service | Local URL | Description |
|---------|-----------|-------------|
| **Application** | http://localhost:3000 | Main development app |
| **Supabase API** | http://localhost:54321 | Database API |
| **Supabase Studio** | http://localhost:54323 | Database dashboard |
| **Email Testing** | http://localhost:54328 | Test emails |
| **Database** | localhost:54322 | Direct DB connection |

## Troubleshooting

### Docker Issues

**Problem**: Docker daemon not running
```bash
# Start Docker Desktop (Windows/Mac) or service (Linux)
sudo systemctl start docker  # Linux
```

**Problem**: Port conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :5432  # Linux
lsof -i :5432                # macOS

# Change ports in docker-compose.yml if needed
```

### Database Issues

**Problem**: Database connection failed
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs supabase-db

# Restart containers
docker-compose restart
```

**Problem**: Database is empty
```bash
# Check status
node scripts/check-db-status.js local

# Seed database
node scripts/seed-database.js local
```

### Application Issues

**Problem**: Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Environment variables not loading
```bash
# Verify .env.development exists
ls -la .env*

# Check required variables
npm run validate-env
```

## Development Tips

### 1. Hot Reloading
- The development server supports hot reloading for most changes
- Database schema changes require container restart
- Environment variable changes require server restart

### 2. Database Development
- Use Supabase Studio (http://localhost:54323) for visual database management
- All database changes should be done through migrations in production
- Use the seeding scripts for consistent test data

### 3. API Development
- Local API endpoints are available at http://localhost:3000/api/
- Use the built-in health check: http://localhost:3000/api/health
- Authentication works with local Supabase

### 4. Testing Email
- All emails are captured by the local email service
- View sent emails at http://localhost:54328
- No external email sending in development

## Production Considerations

### Environment Differences

| Feature | Local | Staging | Production |
|---------|-------|---------|------------|
| **Database** | Local PostgreSQL | Staging Supabase | Production Supabase |
| **Email** | Local capture | Real emails | Real emails |
| **Payments** | Test mode | Test mode | Live mode |
| **Debug Mode** | Enabled | Enabled | Disabled |
| **Logging** | Debug | Info | Info |

### Deployment Readiness

Before deploying to staging/production:

1. **Test thoroughly** in local environment
2. **Run all tests**: `npm run test`
3. **Check build**: `npm run build`
4. **Validate environment**: `npm run validate-env`
5. **Commit changes** and push to appropriate branch

## Getting Help

- **Documentation**: Check this guide and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Database**: Use Supabase Studio for database exploration
- **Logs**: Check both application logs and Docker logs

## Next Steps

1. Complete the initial setup above
2. Explore the codebase structure
3. Read the main project documentation
4. Start building features!

Happy coding! 🚀
