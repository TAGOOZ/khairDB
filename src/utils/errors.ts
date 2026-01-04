import { AuthError } from '../types/auth';

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function getErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.code) {
      case 'auth/invalid-credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/user-not-found':
        return 'Account not properly set up. Please contact support.';
      case 'auth/email-not-verified':
        return 'Please verify your email address before signing in.';
      case 'auth/unexpected-error':
        return 'An unexpected error occurred. Please try again.';
      default:
        return error.message;
    }
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return 'An unknown error occurred';
}

export class ServiceError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.details = details;
  }
}
