import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { TextArea } from '../../ui/TextArea';
import { useLanguage } from '../../../contexts/LanguageContext';

const childSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const age = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age < 18;
    }, 'Child must be under 18 years old'),
  gender: z.enum(['boy', 'girl']),
  school_stage: z.enum(['kindergarten', 'primary', 'preparatory', 'secondary']),
  description: z.string().optional()
});

type ChildFormData = z.infer<typeof childSchema>;

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChildFormData) => Promise<void>;
  isLoading: boolean;
}

export function AddChildModal({ isOpen, onClose, onSubmit, isLoading }: AddChildModalProps) {
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema)
  });

  const handleFormSubmit = async (data: ChildFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addChild')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label={t('childName')}
          {...register('first_name')}
          error={errors.first_name?.message}
        />

        <Input
          label={t('lastName')}
          {...register('last_name')}
          error={errors.last_name?.message}
        />

        <Input
          type="date"
          label={t('dateOfBirth')}
          {...register('date_of_birth')}
          error={errors.date_of_birth?.message}
          max={new Date().toISOString().split('T')[0]}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('gender')}
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('gender')}
                value="boy"
                className="form-radio text-blue-600"
              />
              <span className="mr-2">{t('boy')}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('gender')}
                value="girl"
                className="form-radio text-blue-600"
              />
              <span className="mr-2">{t('girl')}</span>
            </label>
          </div>
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <Select
          label={t('schoolStage')}
          {...register('school_stage')}
          error={errors.school_stage?.message}
          options={[
            { value: 'kindergarten', label: t('kindergarten') },
            { value: 'primary', label: t('primary') },
            { value: 'preparatory', label: t('preparatory') },
            { value: 'secondary', label: t('secondary') }
          ]}
        />

        <TextArea
          label={t('description')}
          {...register('description')}
          error={errors.description?.message}
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