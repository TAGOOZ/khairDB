import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { useLanguage } from '../../../contexts/LanguageContext';

const elseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  role: z.enum(['spouse', 'sibling', 'grandparent', 'other']),
  job_title: z.string().optional(),
  phone_number: z.string().optional()
    .refine(val => !val || /^[0-9+\-\s()]*$/.test(val), 'Invalid phone number format'),
  relation: z.string().min(1, 'Relation is required')
});

type ElseFormData = z.infer<typeof elseSchema>;

interface AddElseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ElseFormData) => Promise<void>;
  isLoading: boolean;
}

export function AddElseModal({ isOpen, onClose, onSubmit, isLoading }: AddElseModalProps) {
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ElseFormData>({
    resolver: zodResolver(elseSchema)
  });

  const handleFormSubmit = async (data: ElseFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addElse')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label={t('name')}
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          type="date"
          label={t('dateOfBirth')}
          {...register('date_of_birth')}
          error={errors.date_of_birth?.message}
          max={new Date().toISOString().split('T')[0]}
        />

        <Select
          label={t('gender')}
          {...register('gender')}
          error={errors.gender?.message}
          options={[
            { value: 'male', label: t('male') },
            { value: 'female', label: t('female') }
          ]}
        />

        <Select
          label={t('role')}
          {...register('role')}
          error={errors.role?.message}
          options={[
            { value: 'spouse', label: t('spouse') },
            { value: 'sibling', label: t('sibling') },
            { value: 'grandparent', label: t('grandparent') },
            { value: 'other', label: t('other') }
          ]}
        />

        <Input
          label={t('jobTitle')}
          {...register('job_title')}
          error={errors.job_title?.message}
        />

        <Input
          label={t('phoneNumber')}
          {...register('phone_number')}
          error={errors.phone_number?.message}
        />

        <Select
          label={t('relation')}
          {...register('relation')}
          error={errors.relation?.message}
          options={[
            { value: 'wife', label: t('wife') },
            { value: 'husband', label: t('husband') },
            { value: 'sister', label: t('sister') },
            { value: 'brother', label: t('brother') },
            { value: 'mother', label: t('mother') },
            { value: 'father', label: t('father') },
            { value: 'mother_in_law', label: t('motherInLaw') },
            { value: 'father_in_law', label: t('fatherInLaw') },
            { value: 'daughters_husband', label: t('daughtersHusband') },
            { value: 'sons_wife', label: t('sonsWife') }
          ]}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t('add')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}