import { supabase } from '../lib/supabase';
import { User } from '../types';

export class UserError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'UserError';
  }
}

interface UserMetrics {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentlyCreated: number;
}

interface ActivityLog {
  id: string;
  action: string;
  user_id: string;
  user_name: string;
  target_user_id?: string;
  target_user_name?: string;
  details: string;
  created_at: string;
}

/**
 * Fetches all users from the database.
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new UserError('fetch-failed', error.message, error);
    }
    return data || [];
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw new UserError('unexpected', 'An unexpected error occurred while fetching users.', error);
  }
}

/**
 * Creates a new user.
 * This function calls a Supabase Edge Function to securely create users.
 */
export async function createUser(userData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}): Promise<User> {
  try {
    // Call the Edge Function for secure user creation
    const { data, error } = await supabase.functions.invoke('create-user-admin', {
      body: {
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
      },
    });

    if (error) {
      throw new UserError('creation-failed', error.message, error);
    }

    if (!data || !data.user) {
      throw new UserError('creation-failed', 'Failed to create user - no data returned');
    }

    return data.user;
  } catch (error) {
    if (error instanceof UserError) throw error;
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('email')) {
        throw new UserError('email-exists', 'A user with this email already exists.');
      }
      if (error.message.includes('password')) {
        throw new UserError('weak-password', 'Password is too weak. Please use at least 6 characters.');
      }
    }
    
    throw new UserError('unexpected', 'An unexpected error occurred while creating the user.', error);
  }
}

/**
 * Updates an existing user's details.
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  try {
    // For sensitive operations like role changes, use Edge Function
    if (userData.role) {
      const { data, error } = await supabase.functions.invoke('update-user-admin', {
        body: {
          user_id: userId,
          ...userData,
        },
      });

      if (error) {
        throw new UserError('update-failed', error.message, error);
      }

      return data.user;
    } else {
      // For non-sensitive updates, update directly
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new UserError('update-failed', error.message, error);
      }

      return data;
    }
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw new UserError('unexpected', 'An unexpected error occurred while updating the user.', error);
  }
}

/**
 * Deletes a user from the system.
 * This function calls a Supabase Edge Function to securely delete users.
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('delete-user-admin', {
      body: { user_id: userId },
    });

    if (error) {
      throw new UserError('deletion-failed', error.message, error);
    }
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw new UserError('unexpected', 'An unexpected error occurred while deleting the user.', error);
  }
}

/**
 * Gets user metrics for the dashboard.
 */
export async function getUserMetrics(): Promise<UserMetrics> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('role, created_at');

    if (error) {
      throw new UserError('metrics-failed', error.message, error);
    }

    const totalUsers = users?.length || 0;
    const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
    const regularUsers = users?.filter(u => u.role === 'user').length || 0;
    
    // Count users created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyCreated = users?.filter(u => 
      new Date(u.created_at) > sevenDaysAgo
    ).length || 0;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      recentlyCreated,
    };
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw new UserError('unexpected', 'An unexpected error occurred while fetching metrics.', error);
  }
}

/**
 * Gets user activity logs.
 * Note: This is a placeholder implementation. In a real app, you'd have a separate logs table.
 */
export async function getUserActivityLogs(): Promise<ActivityLog[]> {
  try {
    // This is a placeholder implementation
    // In a real application, you would have a separate user_activity_logs table
    // For now, we'll return mock data based on user creation dates
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new UserError('logs-failed', error.message, error);
    }

    // Convert user data to activity logs format
    const logs: ActivityLog[] = users?.map((user, index) => ({
      id: `log-${user.id}-${index}`,
      action: 'User Created',
      user_id: user.id,
      user_name: 'System',
      target_user_id: user.id,
      target_user_name: `${user.first_name} ${user.last_name}`,
      details: `New ${user.role} account created for ${user.email}`,
      created_at: user.created_at,
    })) || [];

    return logs;
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw new UserError('unexpected', 'An unexpected error occurred while fetching activity logs.', error);
  }
}