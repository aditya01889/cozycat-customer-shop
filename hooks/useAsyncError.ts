'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/Toast/ToastProvider';
import { ErrorHandler, withErrorHandling } from '@/lib/errors/error-handler';

interface UseAsyncErrorOptions {
  showToasts?: boolean;
  onError?: (error: any) => void;
  onSuccess?: (result: any) => void;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: any;
}

export function useAsyncError<T = any>(options: UseAsyncErrorOptions = {}) {
  const { showToasts = true, onError, onSuccess } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });
  const { showError, showSuccess } = useToast();

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    successMessage?: string,
    context?: string
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await withErrorHandling(asyncFunction, undefined, context);
      
      setState({
        data: result,
        loading: false,
        error: null
      });

      if (successMessage && showToasts) {
        showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const appError = ErrorHandler.fromError(error, context);
      
      setState({
        data: null,
        loading: false,
        error: appError
      });

      if (showToasts) {
        showError(appError);
      }

      if (onError) {
        onError(appError);
      }

      return null;
    }
  }, [showToasts, showError, showSuccess, onError, onSuccess]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook for form submissions with error handling
export function useFormSubmit<T = any>(options: UseAsyncErrorOptions = {}) {
  const { execute, loading, error, data, reset } = useAsyncError<T>(options);

  const submit = useCallback(async (
    submitFunction: () => Promise<T>,
    successMessage = 'Form submitted successfully!',
    context = 'form submission'
  ) => {
    return await execute(submitFunction, successMessage, context);
  }, [execute]);

  return {
    submit,
    loading,
    error,
    data,
    reset
  };
}
