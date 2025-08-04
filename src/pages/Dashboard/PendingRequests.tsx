import React, { useState } from 'react';
    import { CheckCircle, XCircle, Search, User, Phone, MapPin, Briefcase, Calendar, Edit, Trash2 } from 'lucide-react';
    import { usePendingRequests } from '../../hooks/usePendingRequests';
    import { Button } from '../../components/ui/Button';
    import { TextArea } from '../../components/ui/TextArea';
    import { formatDate, formatCurrency } from '../../utils/formatters';
    import { useAuthStore } from '../../store/authStore';
    import { approveRequest, rejectRequest, deleteRequest, editRequest } from '../../services/pendingRequests';
    import { toast } from '../Individuals/Toast';
    import { Select } from '../../components/ui/Select';
    import { Input } from '../../components/ui/Input';
    import { Card, CardHeader, CardContent } from '../../components/ui/Card';
    import { NeedsBadge } from '../../components/NeedsBadge';
    import { AddIndividualModal } from '../../components/modals/AddIndividualModal';
    import { useFamilies } from '../../hooks/useFamilies';
    import { Modal } from '../../components/ui/Modal';
    import { useLanguage } from '../../contexts/LanguageContext';
    
    export function PendingRequests() {
      const { t } = useLanguage();
      const { requests, isLoading, refreshRequests } = usePendingRequests();
      const { user } = useAuthStore();
      const { families } = useFamilies();
      const isAdmin = user?.role === 'admin';
    
      const [selectedRequest, setSelectedRequest] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [comment, setComment] = useState('');
      const [filters, setFilters] = useState({
        search: '',
        status: 'pending'
      });
      const [isEditModalOpen, setIsEditModalOpen] = useState(false);
      const [editingRequest, setEditingRequest] = useState(null);
      const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
      const filteredRequests = requests.filter(request => {
        const matchesSearch = filters.search
          ? JSON.stringify(request.data).toLowerCase().includes(filters.search.toLowerCase())
          : true;
        const matchesStatus = filters.status ? request.status === filters.status : true;
        return matchesSearch && matchesStatus;
      });
    
      const canEditOrDelete = (request) => {
        return request.submitted_by === user?.id && request.status !== 'approved';
      };
    
      const handleApprove = async (id: string) => {
        try {
          setIsSubmitting(true);
          await approveRequest(id, comment);
          toast.success('Request approved successfully');
          setSelectedRequest(null);
          setComment('');
          refreshRequests();
        } catch (error) {
          console.error('Error approving request:', error);
          toast.error('Failed to approve request');
        } finally {
          setIsSubmitting(false);
        }
      };
    
      const handleReject = async (id: string) => {
        if (!comment.trim()) {
          toast.error('Please provide a comment for rejection');
          return;
        }
    
        try {
          setIsSubmitting(true);
          await rejectRequest(id, comment);
          toast.success('Request rejected successfully');
          setSelectedRequest(null);
          setComment('');
          refreshRequests();
          setIsRejectModalOpen(false);
        } catch (error) {
          console.error('Error rejecting request:', error);
          toast.error('Failed to reject request');
        } finally {
          setIsSubmitting(false);
        }
      };
    
      const handleDelete = async (id: string) => {
        try {
          setIsSubmitting(true);
          await deleteRequest(id);
          toast.success('Request deleted successfully');
          refreshRequests();
          setIsDeleteModalOpen(false);
        } catch (error) {
          console.error('Error deleting request:', error);
          toast.error('Failed to delete request');
        } finally {
          setIsSubmitting(false);
        }
      };
    
      const handleEdit = (request) => {
        setEditingRequest(request);
        setIsEditModalOpen(true);
      };
    
      const handleEditSubmit = async (data) => {
        try {
          // The edit_request function will be called from the service layer
          // which will create a new version of the request
          await editRequest(editingRequest.id, data);
          toast.success('Request updated successfully');
          setIsEditModalOpen(false);
          setEditingRequest(null);
          refreshRequests();
        } catch (error) {
          console.error('Error updating request:', error);
          toast.error('Failed to update request');
        } finally {
          setIsSubmitting(false);
        }
      };
    
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
      };
    
      const renderRequestData = (data) => {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {data.first_name} {data.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDate(data.date_of_birth)}
                  </span>
                </div>
                {data.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{data.phone}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">District {data.district}</span>
                </div>
                {data.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{data.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {data.employment_status === 'no_salary' && 'No salary'}
                    {data.employment_status === 'has_salary' && `Salary: ${data.salary}`}
                    {data.employment_status === 'social_support' && 'تكافل وكرامة'}
                  </span>
                </div>
              </div>
            </div>
    
            {data.needs && data.needs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Needs</h4>
                <div className="flex flex-wrap gap-2">
                  {data.needs.map((need, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <NeedsBadge need={need} />
                      <span className="text-sm text-gray-600">{need.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
    
            {data.description && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900">Additional Information</h4>
                <p className="text-sm text-gray-600">{data.description}</p>
              </div>
            )}
          </div>
        );
      };
    
      if (isLoading) {
        return (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        );
      }
    
      return (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">{t('requests')}</h2>
            </div>
    
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={t('searchRequests')}
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  <div className="w-48">
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      options={[
                        { value: 'pending', label: t('pending') },
                        { value: 'approved', label: t('approved') },
                        { value: 'rejected', label: t('rejected') }
                      ]}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              Request from {request.submitted_by_user?.first_name} {request.submitted_by_user?.last_name}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[request.status]}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Submitted on {formatDate(request.submitted_at)}
                          </p>
                        </div>
    
                        <div className="flex space-x-2">
                          {isAdmin && request.status === 'pending' && (
                            <div className="flex items-start space-x-2">
                              
                              <div className="flex flex-col space-y-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={CheckCircle}
                                  onClick={() => handleApprove(request.id)}
                                  className="text-green-600 hover:text-green-700"
                                  disabled={isSubmitting}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={XCircle}
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsRejectModalOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                  disabled={isSubmitting}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                          {canEditOrDelete(request) && (
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Edit}
                                onClick={() => handleEdit(request)}
                                className="text-blue-600 hover:text-blue-700"
                                disabled={isSubmitting}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Trash2}
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                                disabled={isSubmitting}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
    
                      <div className="bg-gray-50 rounded-lg p-4">
                        {renderRequestData(request.data)}
                      </div>
    
                      {request.admin_comment && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-900">Admin Comment:</p>
                          <p className="mt-1 text-sm text-blue-700">{request.admin_comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
    
                  {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {t('noRequestsFound')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
    
          {isEditModalOpen && editingRequest && (
            <AddIndividualModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingRequest(null);
              }}
              onSubmit={handleEditSubmit}
              isLoading={isSubmitting}
              families={families}
              individual={editingRequest.data}
              mode="edit"
              userRole={user?.role}
            />
          )}
          
          {/* Reject Modal */}
          <Modal
            isOpen={isRejectModalOpen && !!selectedRequest}
            onClose={() => {
              setIsRejectModalOpen(false);
              setSelectedRequest(null);
              setComment('');
            }}
            title="Reject Request"
          >
            <TextArea
              placeholder="Add a rejection comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedRequest(null);
                  setComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedRequest?.id)}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </div>
          </Modal>
    
          {/* Delete Modal */}
          <Modal
            isOpen={isDeleteModalOpen && !!selectedRequest}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedRequest(null);
            }}
            title="Confirm Delete"
          >
            <p className="text-gray-700">Are you sure you want to delete this request?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(selectedRequest?.id)}
                isLoading={isSubmitting}
                className="text-red-600 hover:text-red-700"
              >
                Confirm
              </Button>
            </div>
          </Modal>
        </>
      );
    }
