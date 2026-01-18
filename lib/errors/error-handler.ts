import { AppError, ErrorType } from './error-types';
import { getRandomMessage, getErrorInfo } from './error-messages';

export type { AppError };
export { ErrorType };

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    details?: any,
    statusCode?: number,
    context?: string
  ): AppError {
    return {
      type,
      message,
      userMessage: getRandomMessage(type),
      statusCode,
      details,
      timestamp: new Date(),
      context
    };
  }

  static fromError(error: any, context?: string): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    // Handle common error patterns
    if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK,
        error.message || 'Network error occurred',
        error,
        undefined,
        context
      );
    }

    if (error?.message?.includes('Invalid login credentials')) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        error.message,
        error,
        401,
        context
      );
    }

    if (error?.message?.includes('Unauthorized') || error?.status === 401) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        error.message || 'Unauthorized access',
        error,
        401,
        context
      );
    }

    if (error?.message?.includes('Forbidden') || error?.status === 403) {
      return this.createError(
        ErrorType.AUTHORIZATION,
        error.message || 'Access forbidden',
        error,
        403,
        context
      );
    }

    if (error?.message?.includes('Not found') || error?.status === 404) {
      return this.createError(
        ErrorType.NOT_FOUND,
        error.message || 'Resource not found',
        error,
        404,
        context
      );
    }

    if (error?.message?.includes('Validation') || error?.status === 400) {
      return this.createError(
        ErrorType.VALIDATION,
        error.message || 'Validation error',
        error,
        400,
        context
      );
    }

    if (error?.message?.includes('timeout')) {
      return this.createError(
        ErrorType.NETWORK,
        error.message || 'Request timeout',
        error,
        408,
        context
      );
    }

    // Default to server error
    return this.createError(
      ErrorType.SERVER_ERROR,
      error?.message || 'An unexpected error occurred',
      error,
      error?.status || 500,
      context
    );
  }

  static isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error && 'timestamp' in error;
  }

  static getErrorTitle(type: ErrorType): string {
    return getErrorInfo(type).title;
  }

  static getErrorRecovery(type: ErrorType): string {
    return getErrorInfo(type).recovery;
  }

  static logError(error: AppError, additionalInfo?: any) {
    const logData = {
      type: error.type,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
      context: error.context,
      timestamp: error.timestamp,
      details: error.details,
      additionalInfo
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(`🐾 ${this.getErrorTitle(error.type)}`);
      console.error('Error:', logData);
      console.groupEnd();
    }

    // In production, you might want to send to a logging service
    // Example: Sentry.captureException(error, { extra: logData });
  }

  static sanitizeForDisplay(error: AppError): {
    title: string;
    message: string;
    recovery: string;
    showDetails: boolean;
  } {
    return {
      title: this.getErrorTitle(error.type),
      message: error.userMessage,
      recovery: this.getErrorRecovery(error.type),
      showDetails: process.env.NODE_ENV === 'development'
    };
  }
}

// Utility function for async operations
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const appError = ErrorHandler.fromError(error, context);
    ErrorHandler.logError(appError);
    throw appError;
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    const appError = ErrorHandler.fromError(error, context);
    ErrorHandler.logError(appError);
    return appError;
  };

  return { handleError };
};
