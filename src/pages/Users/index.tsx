import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, Search, Users as UsersIcon, Shield, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserMetrics,
  getUserActivityLogs
} from '../../services/users';
import { ServiceError } from '../../utils/errors';
import { toast } from '../Individuals/Toast';
import { formatDate } from '../../utils/formatters';

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

export function Users() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentlyCreated: 0
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'metrics'>('users');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, userMetrics, logs] = await Promise.all([
        getAllUsers(),
        getUserMetrics(),
        getUserActivityLogs()
      ]);
      setUsers(fetchedUsers);
      setMetrics(userMetrics);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('failedToFetchUsers'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success(t('userDeletedSuccessfully'));
      fetchUsers();
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error instanceof ServiceError) {
        toast.error(error.message);
      } else {
        toast.error(t('failedToDeleteUser'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const userData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as 'admin' | 'user',
      };

      if (modalMode === 'create') {
        const password = formData.get('password') as string;
        await createUser({ ...userData, password });
        toast.success(t('userCreatedSuccessfully'));
      } else if (selectedUser) {
        await updateUser(selectedUser.id, userData);
        toast.success(t('userUpdatedSuccessfully'));
      }
      fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      if (error instanceof ServiceError) {
        toast.error(error.message);
      } else {
        toast.error(t('failedToSaveUser'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('userManagementTitle')}</h1>
        <Button onClick={handleAddUser} icon={Plus}>
          {t('addNewUser')}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('totalUsers')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{metrics.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('administrators')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{metrics.adminUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('regularUsers')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{metrics.regularUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('recentSevenDays')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{metrics.recentlyCreated}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {t('users')}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {t('activityLogs')}
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'metrics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {t('metrics')}
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchByNameOrEmail')}
                icon={Search}
              />
              <Select
                label={t('filterByRole')}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                options={[
                  { value: 'all', label: t('allRoles') },
                  { value: 'admin', label: t('administrators') },
                  { value: 'user', label: t('regularUsers') },
                ]}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                      {t('name')}
                    </th>
                    <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                      {t('email')}
                    </th>
                    <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                      {t('role')}
                    </th>
                    <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                      {t('createdAt')}
                    </th>
                    <th className={`px-6 py-3 text-${isRTL ? 'left' : 'right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                          ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleViewUser(user)}
                          >
                            {t('view')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            onClick={() => handleEditUser(user)}
                          >
                            {t('edit')}
                          </Button>
                          {currentUser?.id !== user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700"
                            >
                              {t('delete')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t('recentActivity')}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activityLogs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.action} by {log.user_name}
                    </p>
                    <p className="text-sm text-gray-500">{log.details}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(log.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{t('userDistribution')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('totalUsers')}</span>
                <span className="font-medium">{metrics.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('administrators')}</span>
                <span className="font-medium text-blue-600">{metrics.adminUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('regularUsers')}</span>
                <span className="font-medium text-gray-600">{metrics.regularUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('adminPercentage')}</span>
                <span className="font-medium">
                  {metrics.totalUsers > 0 ? Math.round((metrics.adminUsers / metrics.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{t('recentActivity')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('newUsersSevenDays')}</span>
                <span className="font-medium">{metrics.recentlyCreated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('totalActivityLogs')}</span>
                <span className="font-medium">{activityLogs.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'create' ? t('addNewUser') : t('editUser')}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleModalSubmit(new FormData(e.currentTarget));
          }} className="space-y-4">
            <Input
              label={t('firstName')}
              name="first_name"
              defaultValue={selectedUser?.first_name || ''}
              required
            />
            <Input
              label={t('lastName')}
              name="last_name"
              defaultValue={selectedUser?.last_name || ''}
              required
            />
            <Input
              label={t('email')}
              name="email"
              type="email"
              defaultValue={selectedUser?.email || ''}
              required
            />
            {modalMode === 'create' && (
              <Input
                label={t('password')}
                name="password"
                type="password"
                required
                placeholder={t('password')}
              />
            )}
            <Select
              label={t('role')}
              name="role"
              defaultValue={selectedUser?.role || 'user'}
              options={[
                { value: 'user', label: t('user') },
                { value: 'admin', label: t('admin') },
              ]}
              required
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {modalMode === 'create' ? t('addNewUser') : t('save')}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="User Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.updated_at)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedUser && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete the user <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. The user will be permanently removed from the system.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                isLoading={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}