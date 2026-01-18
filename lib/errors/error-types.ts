export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  DATABASE = 'database',
  PAYMENT = 'payment',
  CART = 'cart',
  ORDER = 'order',
  PRODUCT = 'product',
  PROFILE = 'profile',
  EMAIL = 'email',
  FILE_UPLOAD = 'file_upload',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  details?: any;
  timestamp: Date;
  context?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ToastConfig {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: React.CSSProperties;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
