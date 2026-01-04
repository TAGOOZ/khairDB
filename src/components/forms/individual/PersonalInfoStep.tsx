import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { X } from 'lucide-react';
import { getHashtagCounts, Hashtag } from '../../../services/hashtags';

export function PersonalInfoStep() {
  const { t } = useLanguage();
  const { register, formState: { errors }, setValue, watch } = useFormContext<IndividualFormData>();
  const [availableTags, setAvailableTags] = useState<Hashtag[]>([]);

  // Load all hashtags from the system
  useEffect(() => {
    const loadHashtags = async () => {
      const tags = await getHashtagCounts();
      setAvailableTags(tags);
    };

    loadHashtags();
  }, []);

  // Track selected hashtags
  const selectedHashtags = watch('hashtags') || [];

  // Add a hashtag to selection
  const addHashtag = (hashtag: string) => {
    if (!selectedHashtags.includes(hashtag)) {
      const newHashtags = [...selectedHashtags, hashtag];
      setValue('hashtags', newHashtags);
    }
  };

  // Remove a hashtag from selection
  const removeHashtag = (hashtag: string) => {
    const newHashtags = selectedHashtags.filter(tag => tag !== hashtag);
    setValue('hashtags', newHashtags);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="first_name">
          {t('firstName')} <span className="text-red-500">*</span>
        </label>
        <input
          id="first_name"
          type="text"
          {...register('first_name')}
          aria-invalid={errors.first_name ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.first_name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="last_name">
          {t('lastName')} <span className="text-red-500">*</span>
        </label>
        <input
          id="last_name"
          type="text"
          {...register('last_name')}
          aria-invalid={errors.last_name ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.last_name && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.last_name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="id_number">
          {t('idNumber')} <span className="text-red-500">*</span>
          <Tooltip content="National ID number (14 digits)" position="right" />
        </label>
        <input
          id="id_number"
          type="text"
          dir="ltr"
          {...register('id_number')}
          aria-invalid={errors.id_number ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${errors.id_number ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="14 digits"
          inputMode="numeric"
          maxLength={14}
        />
        {errors.id_number ? (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.id_number.message}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">14-digit format</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="date_of_birth">
          {t('dateOfBirth')} <span className="text-red-500">*</span>
        </label>
        <input
          id="date_of_birth"
          type="date"
          {...register('date_of_birth')}
          aria-invalid={errors.date_of_birth ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
            }`}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.date_of_birth && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.date_of_birth.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="gender">
          {t('gender')} <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          {...register('gender')}
          aria-invalid={errors.gender ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">{t('selectGender')}</option>
          <option value="male">{t('male')}</option>
          <option value="female">{t('female')}</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.gender.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="marital_status">
          {t('maritalStatus')} <span className="text-red-500">*</span>
        </label>
        <select
          id="marital_status"
          {...register('marital_status')}
          aria-invalid={errors.marital_status ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${errors.marital_status ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">{t('selectMaritalStatus')}</option>
          <option value="single">{t('single')}</option>
          <option value="married">{t('married')}</option>
          <option value="widowed">{t('widowed')}</option>
        </select>
        {errors.marital_status && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.marital_status.message}
          </p>
        )}
      </div>

      {/* Hashtags Section */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('hashtags')}
          <Tooltip content={t('hashtagsHelp')} position="right" />
        </label>

        <div className="space-y-2">
          {/* Selected hashtags */}
          <div className="flex flex-wrap gap-2">
            {selectedHashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Available hashtags */}
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => addHashtag(tag.name)}
                disabled={selectedHashtags.includes(tag.name)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${selectedHashtags.includes(tag.name)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                #{tag.name}
                <span className="ml-1 text-gray-500">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          {t('description')}
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full p-2 border rounded-md border-gray-300"
          rows={3}
          placeholder="Enter notes or additional information here"
        />
      </div>
    </div>
  );
} 