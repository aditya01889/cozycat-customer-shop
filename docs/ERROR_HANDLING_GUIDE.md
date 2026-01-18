# Error Handling System Guide

## Overview

CozyCatKitchen now features a comprehensive, theme-based error handling and alert system that provides user-friendly, on-brand error messages throughout the application. No more generic 404/500 pages or error popups!

## Features

### 🐾 **Theme-Based Error Messages**
- All error messages use cat-themed, friendly language
- Consistent branding with orange/pink color scheme
- Contextual recovery instructions for each error type

### 🛡️ **Global Error Boundary**
- Catches all React component errors
- Beautiful fallback UI with recovery options
- Development mode with detailed error information

### 🔔 **Smart Toast System**
- Replaces react-hot-toast with themed notifications
- Auto-dismiss with customizable duration
- Multiple types: success, error, warning, info
- Persistent option for critical errors

### 🚨 **API Error Handling**
- Consistent error responses across all API routes
- Automatic error logging and categorization
- Database-specific error handling
- Validation error helpers

## Error Types

The system categorizes errors into these types:

| Type | Description | Example Message |
|------|-------------|----------------|
| `NETWORK` | Connection issues | "Our cat's internet connection is taking a nap!" |
| `AUTHENTICATION` | Login/auth problems | "Please sign in to continue your culinary journey." |
| `AUTHORIZATION` | Permission issues | "This area is for special cats only!" |
| `VALIDATION` | Form/input errors | "Something doesn't taste quite right with that input." |
| `NOT_FOUND` | Missing resources | "This page seems to have wandered off!" |
| `SERVER_ERROR` | Backend issues | "Our kitchen is experiencing technical difficulties." |
| `DATABASE` | Data layer problems | "We can't find our recipe book right now." |
| `PAYMENT` | Payment processing | "The payment processor is being finicky." |
| `CART` | Shopping cart issues | "Your shopping cart is feeling lonely." |
| `ORDER` | Order processing | "The order got stuck in the cat door." |
| `PRODUCT` | Product catalog | "This product is hiding from us." |
| `PROFILE` | User profile | "Having trouble with your profile." |
| `EMAIL` | Email services | "Email service is taking a nap." |
| `FILE_UPLOAD` | File handling | "File upload got stuck in the cat door." |

## Usage Examples

### Frontend Components

```tsx
import { useToast } from '@/components/Toast/ToastProvider';
import { ErrorHandler, ErrorType } from '@/lib/errors/error-handler';

function MyComponent() {
  const { showError, showSuccess } = useToast();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
      showSuccess('Action completed successfully!');
    } catch (error) {
      // Automatic error handling with themed messages
      showError(error);
    }
  };

  // Manual error creation
  const createCustomError = () => {
    const error = ErrorHandler.createError(
      ErrorType.VALIDATION,
      'Custom validation failed',
      { field: 'email' },
      400,
      'user registration'
    );
    showError(error);
  };
}
```

### API Routes

```tsx
import { APIErrorHandler, createSuccessResponse } from '@/lib/errors/api-error-handler';
import { ErrorType } from '@/lib/errors/error-handler';

export const POST = APIErrorHandler.withErrorHandling(async (request: Request) => {
  // Validate input
  const body = await request.json();
  APIErrorHandler.validateRequest(body, ['email', 'password'], 'user signup');

  // Database operations with automatic error handling
  await APIErrorHandler.withDatabaseErrorHandling(async () => {
    // Your database code here
    const { error } = await supabase.from('users').insert(body);
    if (error) throw error;
  }, 'user creation');

  return createSuccessResponse({ userId: '123' }, 'User created successfully');
}, 'user signup');
```

### React Error Boundary

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.log('Caught error:', error);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Async Operations Hook

```tsx
import { useAsyncError } from '@/hooks/useAsyncError';

function UserProfile() {
  const { execute, loading, error, data } = useAsyncError({
    showToasts: true,
    onSuccess: (result) => console.log('Success:', result),
    onError: (error) => console.log('Error:', error)
  });

  const loadProfile = () => {
    execute(
      () => supabase.from('profiles').select('*').single(),
      'Profile loaded successfully!',
      'profile loading'
    );
  };

  return (
    <div>
      <button onClick={loadProfile} disabled={loading}>
        {loading ? 'Loading...' : 'Load Profile'}
      </button>
      {error && <ErrorDisplay error={error} />}
      {data && <ProfileData data={data} />}
    </div>
  );
}
```

## Custom Error Pages

### 404 Page (`/not-found`)
- Cat-themed "Page Ran Away!" message
- Helpful navigation options
- Popular page links
- Recovery suggestions

### 500 Page (`/error`)
- "Kitchen Overheated!" theme
- Automatic error reporting
- Contact support options
- Retry functionality

## Styling and Theming

All error components use:
- **Primary Colors**: Orange (#f97316) and Pink (#ec4899)
- **Background Gradients**: From orange-50 to pink-50
- **Cat Emojis**: Contextual cat-themed icons
- **Animations**: Subtle bounce and pulse effects
- **Responsive Design**: Mobile-first approach

## Development vs Production

### Development Mode
- Shows detailed error information
- Includes stack traces and technical details
- Console logging with grouped output
- Error IDs for debugging

### Production Mode
- User-friendly messages only
- No technical details exposed
- Error logging to external services (configure as needed)
- Graceful degradation

## Migration from react-hot-toast

### Before
```tsx
import toast from 'react-hot-toast';

toast.success('Success!');
toast.error('Error occurred');
```

### After
```tsx
import { useToast } from '@/components/Toast/ToastProvider';

const { showSuccess, showError } = useToast();

showSuccess('Success!');
showError(error); // Automatic error categorization
```

## Best Practices

1. **Always use the error handler** - Don't try/catch without using our system
2. **Provide context** - Include context strings for better debugging
3. **Use specific error types** - Choose the most appropriate ErrorType
4. **Handle async operations** - Use the `useAsyncError` hook
5. **Validate inputs** - Use `APIErrorHandler.validateRequest` in API routes
6. **Wrap database calls** - Use `withDatabaseErrorHandling` for DB operations
7. **Test error flows** - Ensure all error paths are tested

## Configuration

### Toast Duration (milliseconds)
- Success: 4000ms
- Error: 6000ms
- Warning: 5000ms
- Info: 4000ms

### Error Logging
- Development: Console output with grouping
- Production: Configure external logging service (Sentry, LogRocket, etc.)

## File Structure

```
lib/errors/
├── error-types.ts          # Type definitions
├── error-messages.ts       # Themed error messages
├── error-handler.ts        # Core error handling logic
└── api-error-handler.ts    # API-specific error handling

components/
├── ErrorBoundary.tsx       # React error boundary
├── ErrorDisplay.tsx        # Reusable error component
├── LoadingSpinner.tsx      # Loading components
└── Toast/
    └── ToastProvider.tsx   # Toast system

hooks/
└── useAsyncError.ts        # Async operation hook

app/
├── error.ts               # 500 error page
└── not-found.ts          # 404 error page
```

## Testing

Test your error handling with these scenarios:

1. **Network failures** - Disconnect network and test API calls
2. **Authentication errors** - Try accessing protected routes
3. **Validation errors** - Submit invalid form data
4. **Database errors** - Simulate database connection issues
5. **Component errors** - Throw errors in React components
6. **Missing resources** - Access non-existent pages/data

## Support

For questions or issues with the error handling system:
1. Check this guide first
2. Look at existing implementations in the codebase
3. Test in development mode for detailed error information
4. Contact the development team for assistance

---

Remember: Good error handling is not about preventing errors - it's about handling them gracefully when they inevitably occur! 🐾
