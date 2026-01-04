import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/LoginForm';
import { getErrorMessage } from '../utils/errors';
import { AUTH_CONFIG } from '../config/auth';

export function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuthStore();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your account
            </p>
          </div>

          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />

          {AUTH_CONFIG.exampleCredentials && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Example Credentials</h3>
              <div className="text-sm text-blue-700">
                <p>Email: {AUTH_CONFIG.exampleCredentials.email}</p>
                <p>Password: {AUTH_CONFIG.exampleCredentials.password}</p>
                <p className="mt-1 text-xs text-blue-600">Role: {AUTH_CONFIG.exampleCredentials.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
