import { supabase } from '../lib/supabase';
import { User } from '../types';
import { logActivity, getActivityLogs as fetchActivityLogs, GetActivityLogsOptions, GetActivityLogsResult } from './activityLogs';
import { ServiceError } from '../utils/errors';

interface UserMetrics {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentlyCreated: number;
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
      throw new ServiceError('fetch-failed', error.message, error);
    }
    return data || [];
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred while fetching users.', error);
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
      throw new ServiceError('creation-failed', error.message, error);
    }

    if (!data || !data.user) {
      throw new ServiceError('creation-failed', 'Failed to create user - no data returned');
    }

    // Log the activity
    await logActivity(
      'create',
      'user',
      data.user.id,
      `${userData.first_name} ${userData.last_name}`,
      { email: userData.email, role: userData.role }
    );

    return data.user;
  } catch (error) {
    if (error instanceof ServiceError) throw error;

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('email')) {
        throw new ServiceError('email-exists', 'A user with this email already exists.');
      }
      if (error.message.includes('password')) {
        throw new ServiceError('weak-password', 'Password is too weak. Please use at least 6 characters.');
      }
    }

    throw new ServiceError('unexpected', 'An unexpected error occurred while creating the user.', error);
  }
}

/**
 * Updates an existing user's details.
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  try {
    let resultUser: User;

    // For sensitive operations like role changes, use Edge Function
    if (userData.role) {
      const { data, error } = await supabase.functions.invoke('update-user-admin', {
        body: {
          user_id: userId,
          ...userData,
        },
      });

      if (error) {
        throw new ServiceError('update-failed', error.message, error);
      }

      resultUser = data.user;
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
        throw new ServiceError('update-failed', error.message, error);
      }

      resultUser = data;
    }

    // Log the activity
    await logActivity(
      'update',
      'user',
      userId,
      `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
      { updated_fields: Object.keys(userData) }
    );

    return resultUser;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred while updating the user.', error);
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
      throw new ServiceError('deletion-failed', error.message, error);
    }

    // Log the activity
    await logActivity(
      'delete',
      'user',
      userId,
      'User deleted',
      { deleted_user_id: userId }
    );
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred while deleting the user.', error);
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
      throw new ServiceError('metrics-failed', error.message, error);
    }

    const totalUsers = users?.length || 0;
    const adminUsers = users?.filter((u: { role: string }) => u.role === 'admin').length || 0;
    const regularUsers = users?.filter((u: { role: string }) => u.role === 'user').length || 0;

    // Count users created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyCreated = users?.filter((u: { created_at: string }) =>
      new Date(u.created_at) > sevenDaysAgo
    ).length || 0;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      recentlyCreated,
    };
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred while fetching metrics.', error);
  }
}

/**
 * Gets user activity logs using the new activity_logs table.
 * Supports filtering by user, action, entity type, and date range.
 */
export async function getUserActivityLogs(
  options: GetActivityLogsOptions = {}
): Promise<GetActivityLogsResult> {
  return fetchActivityLogs(options);
}