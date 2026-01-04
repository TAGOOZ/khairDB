import React, { useState, useEffect, useCallback } from 'react';
import { ActivityLog } from '../../types';
import { getActivityLogs, getLogUsers, GetActivityLogsOptions } from '../../services/activityLogs';
import { Search, Filter, Calendar, User, Activity, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ACTION_COLORS: Record<string, string> = {
    create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    approve: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    reject: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    login: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    logout: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const ENTITY_ICONS: Record<string, string> = {
    individual: '👤',
    family: '👨‍👩‍👧‍👦',
    distribution: '📦',
    request: '📋',
    user: '🔐',
    child: '👶',
};

const ITEMS_PER_PAGE = 20;

export function Logs() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [selectedEntityType, setSelectedEntityType] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);

    // Users for filter dropdown
    const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const options: GetActivityLogsOptions = {
                limit: ITEMS_PER_PAGE,
                offset: currentPage * ITEMS_PER_PAGE,
            };

            if (selectedUser) options.userId = selectedUser;
            if (selectedAction) options.action = selectedAction;
            if (selectedEntityType) options.entityType = selectedEntityType;
            if (startDate) options.startDate = new Date(startDate);
            if (endDate) options.endDate = new Date(endDate + 'T23:59:59');

            const result = await getActivityLogs(options);
            setLogs(result.logs);
            setTotal(result.total);
        } catch (err) {
            setError(t('noActivityLogsFound'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedUser, selectedAction, selectedEntityType, startDate, endDate, t]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        // Fetch users for filter dropdown
        getLogUsers().then(setUsers).catch(console.error);
    }, []);

    const handleClearFilters = () => {
        setSelectedUser('');
        setSelectedAction('');
        setSelectedEntityType('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(0);
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('activityLogs')}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('monitorUserActivity')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {t('refresh')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="font-medium text-gray-700 dark:text-gray-300">{t('filters')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* User Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <User className="w-4 h-4 inline mr-1" />
                            {t('user')}
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => { setSelectedUser(e.target.value); setCurrentPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('allUsers')}</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Activity className="w-4 h-4 inline mr-1" />
                            {t('action')}
                        </label>
                        <select
                            value={selectedAction}
                            onChange={(e) => { setSelectedAction(e.target.value); setCurrentPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('allActions')}</option>
                            <option value="create">{t('create')}</option>
                            <option value="update">{t('update')}</option>
                            <option value="delete">{t('delete')}</option>
                            <option value="approve">{t('approve')}</option>
                            <option value="reject">{t('reject')}</option>
                        </select>
                    </div>

                    {/* Entity Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Search className="w-4 h-4 inline mr-1" />
                            {t('entity')}
                        </label>
                        <select
                            value={selectedEntityType}
                            onChange={(e) => { setSelectedEntityType(e.target.value); setCurrentPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('allTypes')}</option>
                            <option value="individual">{t('individual')}</option>
                            <option value="family">{t('family')}</option>
                            <option value="distribution">{t('distribution')}</option>
                            <option value="request">{t('request')}</option>
                            <option value="user">{t('user')}</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {t('from')}
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {t('to')}
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {t('clearAllFilters')}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider`}>
                                    {t('time')}
                                </th>
                                <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider`}>
                                    {t('user')}
                                </th>
                                <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider`}>
                                    {t('action')}
                                </th>
                                <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider`}>
                                    {t('entity')}
                                </th>
                                <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider`}>
                                    {t('details')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                                            <span className="text-gray-500 dark:text-gray-400">{t('loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {t('noActivityLogsFound')}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {log.user_name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {log.user_email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span>{ENTITY_ICONS[log.entity_type] || '📄'}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                        {log.entity_type}
                                                    </div>
                                                    {log.entity_name && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {log.entity_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {log.details ? (
                                                <details className="cursor-pointer">
                                                    <summary className="text-blue-600 dark:text-blue-400 hover:underline">
                                                        {t('viewDetails')}
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-w-md">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </details>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'ar'
                                ? `عرض ${currentPage * ITEMS_PER_PAGE + 1} إلى ${Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)} من ${total} سجل`
                                : `Showing ${currentPage * ITEMS_PER_PAGE + 1} to ${Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)} of ${total} entries`}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                                {t('page')} {currentPage + 1} {t('of')} {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Logs;
