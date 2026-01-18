import { NextRequest, NextResponse } from 'next/server';
import { ErrorHandler, ErrorType } from './error-handler';
import { AppError } from './error-handler';

export class APIErrorHandler {
  static handleAPIError(
    error: any,
    context?: string
  ): NextResponse {
    const appError = ErrorHandler.fromError(error, context);
    ErrorHandler.logError(appError);

    const statusCode = appError.statusCode || 500;
    const errorResponse = {
      success: false,
      error: {
        type: appError.type,
        message: appError.userMessage,
        timestamp: appError.timestamp.toISOString(),
        context: appError.context
      }
    };

    // Include technical details in development
    if (process.env.NODE_ENV === 'development') {
      (errorResponse.error as any).technical = {
        originalMessage: appError.message,
        details: appError.details,
        stack: error?.stack
      };
    }

    return NextResponse.json(errorResponse, { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  static withErrorHandling(
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
    context?: string
  ) {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      try {
        return await handler(req, ...args);
      } catch (error) {
        return this.handleAPIError(error, context);
      }
    };
  }

  static createAPIError(
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    details?: any
  ): never {
    const appError = ErrorHandler.createError(type, message, details, statusCode);
    throw appError;
  }

  static validateRequest(
    data: any,
    required: string[],
    context?: string
  ): void {
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      this.createAPIError(
        ErrorType.VALIDATION,
        `Missing required fields: ${missing.join(', ')}`,
        400,
        { missing, provided: Object.keys(data) }
      );
    }
  }

  static async withDatabaseErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Handle common database errors
      if (error?.code === 'PGRST116') {
        this.createAPIError(
          ErrorType.NOT_FOUND,
          'Resource not found',
          404,
          error
        );
      }

      if (error?.code === 'PGRST301') {
        this.createAPIError(
          ErrorType.AUTHORIZATION,
          'You do not have permission to access this resource',
          403,
          error
        );
      }

      if (error?.code === '23505') {
        this.createAPIError(
          ErrorType.VALIDATION,
          'A record with this information already exists',
          409,
          error
        );
      }

      if (error?.code === '23503') {
        this.createAPIError(
          ErrorType.VALIDATION,
          'Referenced resource does not exist',
          400,
          error
        );
      }

      if (error?.message?.includes('timeout')) {
        this.createAPIError(
          ErrorType.DATABASE,
          'Database operation timed out',
          504,
          error
        );
      }

      // Generic database error
      this.createAPIError(
        ErrorType.DATABASE,
        'Database operation failed',
        500,
        error
      );
    }
  }
}

// Utility function for API route handlers
export const createAPIRoute = (
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  context?: string
) => {
  return APIErrorHandler.withErrorHandling(handler, context);
};

// Standard success response helper
export const createSuccessResponse = (
  data: any,
  message?: string,
  statusCode: number = 200
): NextResponse => {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, { 
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
