import React, { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { availableHashtags } from '../../../schemas/individualSchema';
import { X, Upload, ExternalLink, AlertCircle } from 'lucide-react';
import { getHashtagCounts, Hashtag } from '../../../services/hashtags';
import { uploadIdCardImage, deleteFile } from '../../../services/storage';

export function PersonalInfoStep() {
  const { t } = useLanguage();
  const { register, formState: { errors, isSubmitSuccessful }, setValue, getValues, watch } = useFormContext<IndividualFormData>();
  const [availableTags, setAvailableTags] = useState<Hashtag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  
  // Watch for ID card URL to check if it's already uploaded
  const idCardImageUrl = watch('id_card_image_url');
  const idCardImagePath = watch('id_card_image_path');
  
  // Keep track of our uploaded image path for cleanup purposes
  useEffect(() => {
    if (idCardImagePath) {
      setUploadedImagePath(idCardImagePath);
    }
  }, [idCardImagePath]);
  
  // Cleanup handler - delete the image if form wasn't submitted successfully
  useEffect(() => {
    // On component unmount, check if we need to clean up
    return () => {
      // Only delete the file if the form was completely unmounted (not just navigating to the next step)
      // This can be detected by checking if unmounting happened during form submission or step navigation
      // Since we're using a multi-step form, we don't want to delete the image when just moving to the next step
      
      // Don't delete the image when navigating between steps
      // The image will only be deleted if the form is completely closed without submission
      if (uploadedImagePath && !isSubmitSuccessful && document.getElementById('individualForm') === null) {
        console.log('Form closed without submitting, cleaning up uploaded file:', uploadedImagePath);
        deleteFile(uploadedImagePath).catch(error => {
          console.error('Error cleaning up file:', error);
        });
      }
    };
  }, [uploadedImagePath, isSubmitSuccessful]);
  
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

  // Handle ID card image upload
  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Get current form values for firstName and idNumber
      const firstName = getValues('first_name');
      const idNumber = getValues('id_number');
      
      // Upload using our storage service with naming convention
      const { path, url } = await uploadIdCardImage(file, firstName, idNumber);
      
      // Set form values (field names already match)
      setValue('id_card_image_path', path);
      setValue('id_card_image_url', url);
      
      // Track the path for potential cleanup
      setUploadedImagePath(path);
      
      // Show success message temporarily
      alert(t('idCardUploaded'));
      
    } catch (error) {
      console.error('Error uploading ID card:', error);
      setUploadError(t('idCardUploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="first_name">
            {t('firstName')} <span className="text-red-500">*</span>
          </label>
          <input
            id="first_name"
            type="text"
            {...register('first_name')}
            aria-invalid={errors.first_name ? 'true' : 'false'}
            className={`w-full p-2 border rounded-md ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('enterFirstName')}
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
            className={`w-full p-2 border rounded-md ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('enterLastName')}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Hashtags/Projects Section */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Projects/Hashtags
          <Tooltip content="Assign this individual to one or more projects (optional)" position="right" />
        </label>
        
        {/* Selected Hashtags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedHashtags.map(tag => (
            <div 
              key={tag} 
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button 
                type="button" 
                onClick={() => removeHashtag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Available Hashtags */}
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addHashtag(tag.name)}
              disabled={selectedHashtags.includes(tag.name)}
              className={`px-3 py-1 rounded-full text-sm 
                ${selectedHashtags.includes(tag.name) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="id_number">
          {t('idNumber')} <span className="text-red-500">*</span>
          <Tooltip content="National ID number (14 digits)" position="right" />
        </label>
        <input
          id="id_number"
          type="text"
          {...register('id_number')}
          aria-invalid={errors.id_number ? 'true' : 'false'}
          className={`w-full p-2 border rounded-md ${
            errors.id_number ? 'border-red-500' : 'border-gray-300'
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
          className={`w-full p-2 border rounded-md ${
            errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
          }`}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.date_of_birth && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.date_of_birth.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <fieldset>
            <legend className="block text-sm font-medium mb-1">
              {t('gender')} <span className="text-red-500">*</span>
            </legend>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('gender')}
                  value="male"
                  className="mr-2"
                />
                {t('male')}
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('gender')}
                  value="female"
                  className="mr-2"
                />
                {t('female')}
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500" role="alert">
                {errors.gender.message}
              </p>
            )}
          </fieldset>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="marital_status">
            {t('maritalStatus')} <span className="text-red-500">*</span>
          </label>
          <select
            id="marital_status"
            {...register('marital_status')}
            aria-invalid={errors.marital_status ? 'true' : 'false'}
            className={`w-full p-2 border rounded-md ${
              errors.marital_status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
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
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="list_status">
          {t('listStatus')} 
          <Tooltip 
            content="Status for aid eligibility" 
            position="right" 
          />
        </label>
        <select
          id="list_status"
          {...register('list_status')}
          className="w-full p-2 border rounded-md border-gray-300"
        >
          <option value="whitelist">{t('whitelist')}</option>
          <option value="blacklist">{t('blacklist')}</option>
          <option value="waitinglist">{t('waitinglist')}</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Determines eligibility for aid programs
        </p>
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

      {/* ID Card Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="id_card_image">
          {t('idCardImage')}
          <Tooltip content="Upload the individual's ID card image" position="right" />
        </label>
        
        <div className="mt-2">
          {idCardImageUrl ? (
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-sm">✓ {t('idCardUploaded')}</span>
              <a 
                href={idCardImageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {t('viewIdCard')}
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Get current image path
                    const currentPath = getValues('id_card_image_path');
                    if (currentPath) {
                      // Delete file from storage
                      await deleteFile(currentPath);
                      console.log(`File deleted from storage: ${currentPath}`);
                    }
                  } catch (error) {
                    console.error('Error deleting file:', error);
                  } finally {
                    // Clear form values regardless of delete success
                    setValue('id_card_image_path', null);
                    setValue('id_card_image_url', null);
                  }
                }}
                className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                {t('remove')}
              </button>
            </div>
          ) : (
            <div>
              <label
                htmlFor="id_card_image_upload"
                className={`inline-flex items-center px-3 py-2 rounded-md cursor-pointer
                  ${isUploading 
                    ? 'bg-gray-200 text-gray-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : t('uploadIdCard')}
                <input
                  id="id_card_image_upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdCardUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              {uploadError && (
                <div className="mt-2 text-red-500 flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {uploadError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 