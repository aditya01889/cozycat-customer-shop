'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { AppError } from '@/lib/errors/error-handler';
import { ErrorHandler } from '@/lib/errors/error-handler';

interface ErrorDisplayProps {
  error: AppError | Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function ErrorDisplay({
  error,
  onRetry,
  onGoHome,
  showActions = true,
  compact = false
}: ErrorDisplayProps) {
  const appError = ErrorHandler.isAppError(error) ? error : ErrorHandler.fromError(error);
  const errorInfo = ErrorHandler.sanitizeForDisplay(appError);

  if (compact) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-red-800 text-sm">{errorInfo.title}</h4>
            <p className="text-red-700 text-sm mt-1">{errorInfo.message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center">
      {/* Icon */}
      <div className="mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {errorInfo.title}
      </h3>

      {/* Message */}
      <p className="text-gray-600 mb-4">
        {errorInfo.message}
      </p>

      {/* Recovery */}
      <div className="bg-white/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">What to do:</span> {errorInfo.recovery}
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          )}
        </div>
      )}

      {/* Development Details */}
      {errorInfo.showDetails && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Technical Details (Development Only)
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
            <div className="mb-2">
              <strong>Type:</strong> {appError.type}
            </div>
            <div className="mb-2">
              <strong>Message:</strong> {appError.message}
            </div>
            <div className="mb-2">
              <strong>Status Code:</strong> {appError.statusCode || 'N/A'}
            </div>
            <div className="mb-2">
              <strong>Context:</strong> {appError.context || 'N/A'}
            </div>
            <div className="mb-2">
              <strong>Timestamp:</strong> {appError.timestamp.toISOString()}
            </div>
            {appError.details && (
              <div>
                <strong>Details:</strong>
                <pre className="whitespace-pre-wrap mt-1">{JSON.stringify(appError.details, null, 2)}</pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
