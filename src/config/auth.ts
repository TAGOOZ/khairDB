// Only expose example credentials in development mode
const isDevelopment = import.meta.env?.DEV || process.env.NODE_ENV === 'development';

export const AUTH_CONFIG = {
  // Example credentials only available in development
  exampleCredentials: isDevelopment ? {
    email: 'admin@socialservices.org',
    password: 'password123',
    role: 'admin'
  } : null
};
