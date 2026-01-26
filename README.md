# CozyCatKitchen

A modern e-commerce platform for cat food, built with Next.js 16 and Supabase. Features customer shop, admin dashboard, and operations management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
customer-shop/
├── 📁 app/              # Next.js pages
├── 📁 components/       # React components
├── 📁 lib/             # Utilities & middleware
├── 📁 tests/           # Test files
├── 📁 docs/            # Documentation
└── 📄 package.json     # Dependencies
```

## 🛡️ Security Features

- ✅ **Rate Limiting** - Multi-tier API protection
- ✅ **Input Validation** - XSS and injection prevention
- ✅ **CSRF Protection** - Cross-site request forgery prevention
- ✅ **API Security** - Authentication and authorization
- ✅ **Error Handling** - Secure error responses

## 🧪 Testing

### Security Tests
```bash
npm run test:phase1
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm test
```

## 📚 Documentation

- [Project Structure](docs/PROJECT_STRUCTURE.md) - Clean project organization
- [Security Report](docs/PHASE1_SECURITY_TEST_REPORT.md) - Security test results
- [Testing Guide](docs/TESTING_GUIDE.md) - Comprehensive testing guide
- [Production Deployment](docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Deployment checklist

## 🚀 Deployment

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

### Security Validation
```bash
npm run test:phase1
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Testing**: Playwright
- **State Management**: Zustand
- **API**: Next.js API Routes

## 📊 Features

### Customer Shop
- Product catalog with search and filtering
- Shopping cart and checkout
- Order tracking
- User profiles and addresses
- Payment integration

### Admin Dashboard
- Order management
- Product management
- User management
- Analytics and reporting
- Operations management

### Operations
- Inventory management
- Recipe management
- Batch tracking
- Delivery management
- Vendor management

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Rate Limiting
```typescript
// Configured in lib/middleware/rate-limiter.ts
default: 100 requests/15min
auth: 20 requests/15min
admin: 50 requests/15min
public: 200 requests/15min
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Status

- ✅ **Security**: Phase 1 security implementation complete
- ✅ **Testing**: Comprehensive test suite implemented
- ✅ **Production**: Ready for deployment
- ✅ **Documentation**: Complete documentation available

**🚀 Production Ready!**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
