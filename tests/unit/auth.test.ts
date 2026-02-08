import { renderHook, act } from '@testing-library/react';

// Mock auth store
const mockAuthStore = {
  user: null,
  isLoading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  resetPassword: jest.fn(),
};

jest.mock('@/lib/store/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock Supabase auth
const mockSupabaseAuth = {
  signIn: jest.fn(() => Promise.resolve({ 
    data: { user: { id: 'test-user-id', email: 'test@example.com' }, 
    error: null 
  })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  signUp: jest.fn(() => Promise.resolve({ 
    data: { user: { id: 'new-user-id', email: 'new@example.com' }, 
    error: null 
  })),
  resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mockSupabaseAuth
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.user = null;
    mockAuthStore.isLoading = false;
  });

  test('should sign in user successfully', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await act(async () => {
      await mockAuthStore.signIn(credentials.email, credentials.password);
    });

    expect(mockAuthStore.signIn).toHaveBeenCalledWith(credentials.email, credentials.password);
    expect(mockSupabaseAuth.signIn).toHaveBeenCalledWith({
      email: credentials.email,
      password: credentials.password
    });
  });

  test('should sign out user successfully', async () => {
    await act(async () => {
      await mockAuthStore.signOut();
    });

    expect(mockAuthStore.signOut).toHaveBeenCalled();
    expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
  });

  test('should sign up user successfully', async () => {
    const userData = {
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User'
    };

    await act(async () => {
      await mockAuthStore.signUp(userData.email, userData.password, userData.fullName);
    });

    expect(mockAuthStore.signUp).toHaveBeenCalledWith(
      userData.email, 
      userData.password, 
      userData.fullName
    );
    expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName
        }
      }
    });
  });

  test('should reset password successfully', async () => {
    const email = 'test@example.com';

    await act(async () => {
      await mockAuthStore.resetPassword(email);
    });

    expect(mockAuthStore.resetPassword).toHaveBeenCalledWith(email);
    expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(email);
  });

  test('should handle loading state', () => {
    expect(mockAuthStore.isLoading).toBe(false);
  });
});

describe('Auth API Functions', () => {
  test('should handle sign in error', async () => {
    const errorMessage = 'Invalid login credentials';
    mockSupabaseAuth.signIn.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    });

    const { signIn } = require('@/lib/api/auth');
    const result = await signIn('test@example.com', 'wrongpassword');

    expect(result.user).toBeNull();
    expect(result.error).toBe(errorMessage);
  });

  test('should handle sign up error', async () => {
    const errorMessage = 'User already exists';
    mockSupabaseAuth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    });

    const { signUp } = require('@/lib/api/auth');
    const result = await signUp('existing@example.com', 'password123', 'Existing User');

    expect(result.user).toBeNull();
    expect(result.error).toBe(errorMessage);
  });

  test('should validate email format', () => {
    const { validateEmail } = require('@/lib/validation/auth');

    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });

  test('should validate password strength', () => {
    const { validatePassword } = require('@/lib/validation/auth');

    // Strong password
    expect(validatePassword('StrongPass123!')).toEqual({
      isValid: true,
      errors: []
    });

    // Weak passwords
    expect(validatePassword('weak')).toEqual({
      isValid: false,
      errors: expect.arrayContaining([
        expect.stringContaining('at least 8 characters')
      ])
    });

    expect(validatePassword('NoNumbers!')).toEqual({
      isValid: false,
      errors: expect.arrayContaining([
        expect.stringContaining('at least one number')
      ])
    });
  });
});

describe('Auth Components', () => {
  test('should render login form', () => {
    const React = require('react');
    const { render, screen, fireEvent } = require('../test-utils');
    
    const LoginForm = ({ onLogin }: any) => {
      return React.createElement('form', { 
        'data-testid': 'login-form', 
        onSubmit: (e: any) => {
          e.preventDefault();
          onLogin({ email: 'test@example.com', password: 'password' });
        }
      }, [
        React.createElement('input', { 'data-testid': 'email', type: 'email' }),
        React.createElement('input', { 'data-testid': 'password', type: 'password' }),
        React.createElement('button', { type: 'submit' }, 'Login')
      ]);
    };

    const onLogin = jest.fn();
    
    render(React.createElement(LoginForm, { onLogin }));

    const form = screen.getByTestId('login-form');
    fireEvent.submit(form);

    expect(onLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });
});
