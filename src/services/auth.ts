import { supabase } from '../lib/supabase';
import { User } from '../types';
import { AuthError } from '../types/auth';

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      if (authError.status === 400) {
        throw new AuthError('auth/invalid-credentials', 'Invalid email or password. Please check your credentials and try again.');
      }
      throw new AuthError('auth/unexpected-error', authError.message);
    }

    if (!authData.user) {
      throw new AuthError('auth/no-user', 'No user found for this email');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('User data error:', userError);
      await supabase.auth.signOut();
      throw new AuthError('auth/user-not-found', 'Account not properly set up. Please contact support.');
    }

    if (!userData) {
      await supabase.auth.signOut();
      throw new AuthError('auth/user-not-found', 'User profile not found. Please contact support.');
    }

    return userData;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Unexpected error during sign in:', error);
    throw new AuthError('auth/unexpected-error', 'An unexpected error occurred. Please try again.');
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error during sign out:', error);
  }
}

export async function getCurrentSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new AuthError('auth/session-error', 'Failed to get current session');
  }

  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('User data error:', userError);
      await signOut();
      return null;
    }

    if (!userData) {
      await signOut();
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
