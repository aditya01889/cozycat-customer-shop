'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { AppError, ErrorType, ToastConfig } from '@/lib/errors/error-types';
import { ErrorHandler } from '@/lib/errors/error-handler';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  showError: (error: AppError | Error, config?: ToastConfig) => string;
  showSuccess: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 6000 : 4000)
    };

    setToasts(prev => [...prev, newToast]);

    if (!newToast.persistent) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const showError = useCallback((error: AppError | Error, config?: ToastConfig) => {
    let appError: AppError;
    
    if (ErrorHandler.isAppError(error)) {
      appError = error;
    } else {
      appError = ErrorHandler.fromError(error);
    }

    const errorInfo = ErrorHandler.sanitizeForDisplay(appError);
    
    return showToast({
      type: 'error',
      title: errorInfo.title,
      message: errorInfo.message,
      duration: config?.duration ?? 6000,
      action: config?.action,
      persistent: config?.duration === Infinity
    });
  }, [showToast]);

  const showSuccess = useCallback((message: string, title?: string) => {
    return showToast({
      type: 'success',
      title: title || 'Purr-fect! 🐾',
      message
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    return showToast({
      type: 'warning',
      title: title || 'Heads Up! 🐾',
      message
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    return showToast({
      type: 'info',
      title: title || 'Did You Know? 🐾',
      message
    });
  }, [showToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{
      showToast,
      showError,
      showSuccess,
      showWarning,
      showInfo,
      removeToast,
      clearAll
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`
        ${getBgColor()} 
        border rounded-lg shadow-lg p-4 
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right
        max-w-sm
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${getTextColor()}`}>
            {toast.title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`
                text-sm font-medium mt-2 underline
                ${getTextColor()} hover:opacity-80
                focus:outline-none focus:ring-2 focus:ring-offset-2 rounded
              `}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className={`
            flex-shrink-0 p-1 rounded-full
            ${getTextColor()} opacity-60 hover:opacity-100
            focus:outline-none focus:ring-2 focus:ring-offset-2
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
