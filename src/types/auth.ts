export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export type AuthErrorCode = 
  | 'auth/invalid-credentials'
  | 'auth/no-user'
  | 'auth/user-not-found'
  | 'auth/session-error'
  | 'auth/email-not-verified'
  | 'auth/unexpected-error';
