import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';
import { ServiceError } from '../utils/errors';

export type LogAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout';
export type LogEntityType = 'individual' | 'family' | 'distribution' | 'request' | 'user' | 'child';

/**
 * Logs an activity to the activity_logs table.
 * This function is designed to be non-blocking and should not throw errors
 * to prevent interfering with the main operation.
 */
export async function logActivity(
    action: LogAction,
    entityType: LogEntityType,
    entityId?: string,
    entityName?: string,
    details?: Record<string, any>
): Promise<void> {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('Cannot log activity: No authenticated user');
            return;
        }

        // Get user details from users table
        const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single();

        const userName = userData
            ? `${userData.first_name} ${userData.last_name}`
            : user.email || 'Unknown User';

        const userEmail = userData?.email || user.email || null;

        // Insert activity log
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: user.id,
                user_email: userEmail,
                user_name: userName,
                action,
                entity_type: entityType,
                entity_id: entityId || null,
                entity_name: entityName || null,
                details: details || null,
                ip_address: null // Could be obtained via API if needed
            });

        if (error) {
            console.error('Failed to log activity:', error);
            // Don't throw - logging should not break main operations
        }
    } catch (error) {
        console.error('Error in logActivity:', error);
        // Don't throw - logging should not break main operations
    }
}

export interface GetActivityLogsOptions {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

export interface GetActivityLogsResult {
    logs: ActivityLog[];
    total: number;
}

/**
 * Fetches activity logs with optional filtering and pagination.
 */
export async function getActivityLogs(
    options: GetActivityLogsOptions = {}
): Promise<GetActivityLogsResult> {
    try {
        const {
            userId,
            action,
            entityType,
            startDate,
            endDate,
            limit = 50,
            offset = 0
        } = options;

        // Build query
        let query = supabase
            .from('activity_logs')
            .select('*', { count: 'exact' });

        // Apply filters
        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (action) {
            query = query.eq('action', action);
        }

        if (entityType) {
            query = query.eq('entity_type', entityType);
        }

        if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
        }

        if (endDate) {
            query = query.lte('created_at', endDate.toISOString());
        }

        // Apply pagination and ordering
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw new ServiceError('fetch-failed', error.message, error);
        }

        return {
            logs: data || [],
            total: count || 0
        };
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        throw new ServiceError('unexpected', 'An unexpected error occurred while fetching activity logs.', error);
    }
}

/**
 * Gets unique users who have activity logs (for filter dropdown)
 */
export async function getLogUsers(): Promise<{ id: string; name: string; email: string }[]> {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('user_id, user_name, user_email')
            .not('user_id', 'is', null);

        if (error) {
            throw new ServiceError('fetch-failed', error.message, error);
        }

        // Deduplicate by user_id
        const usersMap = new Map<string, { id: string; name: string; email: string }>();
        (data || []).forEach((log: { user_id: string | null; user_name: string | null; user_email: string | null }) => {
            if (log.user_id && !usersMap.has(log.user_id)) {
                usersMap.set(log.user_id, {
                    id: log.user_id,
                    name: log.user_name || 'Unknown',
                    email: log.user_email || ''
                });
            }
        });

        return Array.from(usersMap.values());
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        throw new ServiceError('unexpected', 'Failed to fetch log users.', error);
    }
}
