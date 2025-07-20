import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function ReviewSubmitStep() {
  const { t } = useLanguage();
  const { watch, formState: { errors, isValid, isDirty } } = useFormContext<IndividualFormData>();
  
  // Access form data
  const formData = watch();
  
  // Count errors by section
  const getErrorsBySection = () => {
    const errorCount = {
      personal: 0,
      contact: 0,
      employment: 0,
      assistance: 0,
      family: 0,
      needs: 0
    };
    
    // Check personal info errors
    if (errors.first_name || errors.last_name || errors.id_number || 
        errors.date_of_birth || errors.gender || errors.marital_status || 
        errors.list_status) {
      errorCount.personal++;
    }
    
    // Check contact info errors
    if (errors.phone || errors.district || errors.address || 
        errors.family_id || errors.new_family_name) {
      errorCount.contact++;
    }
    
    // Check employment errors
    if (errors.job || errors.employment_status || errors.salary) {
      errorCount.employment++;
    }
    
    // Check assistance errors
    if (errors.medical_help || errors.food_assistance || 
        errors.marriage_assistance || errors.debt_assistance || 
        errors.education_assistance || errors.shelter_assistance) {
      errorCount.assistance++;
    }
    
    // Check family errors
    if (errors.children || errors.additional_members) {
      errorCount.family++;
    }
    
    // Check needs errors
    if (errors.needs) {
      errorCount.needs++;
    }
    
    return errorCount;
  };
  
  const errorsBySection = getErrorsBySection();
  
  // Calculate total errors
  const totalErrors = Object.values(errorsBySection).reduce((sum, count) => sum + count, 0);
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">
          {t('reviewYourInformation')}
        </h3>
        
        {isValid ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">{t('readyToSubmit')}</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">
              {totalErrors > 0 
                ? t('errorsToFix', { count: totalErrors }) 
                : t('pleaseCompleteForm')}
            </span>
          </div>
        )}
      </div>
      
      {/* Form sections status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { id: 'personal', label: t('personalInformation') },
          { id: 'contact', label: t('contactInformation') },
          { id: 'employment', label: t('employmentInformation') },
          { id: 'assistance', label: t('assistanceNeeds') },
          { id: 'family', label: t('familyMembers') },
          { id: 'needs', label: t('specificNeeds') }
        ].map((section) => (
          <div 
            key={section.id}
            className={`p-3 rounded-lg border flex items-center justify-between
              ${errorsBySection[section.id as keyof typeof errorsBySection] > 0
                ? 'border-red-300 bg-red-50'
                : 'border-green-300 bg-green-50'}`}
          >
            <span className="font-medium">{section.label}</span>
            {errorsBySection[section.id as keyof typeof errorsBySection] > 0 ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
        ))}
      </div>
      
      {/* Summary of information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-lg mb-4">{t('summaryOfInformation')}</h4>
        
        <div className="space-y-4">
          {/* Personal Info summary */}
          <div>
            <h5 className="font-medium text-md text-gray-700 mb-2">{t('personalInformation')}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="font-medium">{t('name')}:</span> {formData.first_name} {formData.last_name}</div>
              <div><span className="font-medium">{t('id')}:</span> {formData.id_number}</div>
              <div><span className="font-medium">{t('dateOfBirth')}:</span> {formatDate(formData.date_of_birth)}</div>
              <div><span className="font-medium">{t('gender')}:</span> {t(formData.gender)}</div>
              <div><span className="font-medium">{t('maritalStatus')}:</span> {t(formData.marital_status)}</div>
              <div><span className="font-medium">{t('listStatus')}:</span> {t(formData.list_status)}</div>
            </div>
            
            {/* Display hashtags */}
            {formData.hashtags && formData.hashtags.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Projects/Hashtags:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.hashtags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {formData.description && (
              <div className="mt-2">
                <span className="font-medium">{t('description')}:</span>
                <p className="text-sm mt-1 text-gray-600">{formData.description}</p>
              </div>
            )}
          </div>
          
          {/* Contact Info summary */}
          <div>
            <h5 className="font-medium text-md text-gray-700 mb-2">{t('contactInformation')}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="font-medium">{t('phone')}:</span> {formData.phone || t('notProvided')}</div>
              <div><span className="font-medium">{t('district')}:</span> {formData.district}</div>
              <div className="md:col-span-2"><span className="font-medium">{t('address')}:</span> {formData.address || t('notProvided')}</div>
              <div className="md:col-span-2">
                <span className="font-medium">{t('family')}:</span> 
                {formData.family_id ? t('existingFamily') : (formData.new_family_name ? formData.new_family_name : t('noFamily'))}
              </div>
            </div>
          </div>
          
          {/* Employment Info summary */}
          <div>
            <h5 className="font-medium text-md text-gray-700 mb-2">{t('employmentInformation')}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="font-medium">{t('job')}:</span> {formData.job || t('notProvided')}</div>
              <div><span className="font-medium">{t('employmentStatus')}:</span> {t(formData.employment_status)}</div>
              {formData.employment_status === 'has_salary' && (
                <div><span className="font-medium">{t('salary')}:</span> ${formData.salary}</div>
              )}
            </div>
          </div>
          
          {/* Family Members summary */}
          {(formData.children.length > 0 || formData.additional_members.length > 0) && (
            <div>
              <h5 className="font-medium text-md text-gray-700 mb-2">{t('familyMembers')}</h5>
              
              {formData.children.length > 0 && (
                <div className="mb-2">
                  <h6 className="text-sm font-medium mb-1">{t('children')}: {formData.children.length}</h6>
                  <ul className="list-disc list-inside text-sm ml-2">
                    {formData.children.map((child, index) => (
                      <li key={index}>
                        {child.first_name} {child.last_name} ({t(child.gender)}, {formatDate(child.date_of_birth)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {formData.additional_members.length > 0 && (
                <div>
                  <h6 className="text-sm font-medium mb-1">{t('adults')}: {formData.additional_members.length}</h6>
                  <ul className="list-disc list-inside text-sm ml-2">
                    {formData.additional_members.map((member, index) => (
                      <li key={index}>
                        {member.name} ({t(member.relation)}, {t(member.gender)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Needs summary */}
          {formData.needs.length > 0 && (
            <div>
              <h5 className="font-medium text-md text-gray-700 mb-2">{t('needs')}: {formData.needs.length}</h5>
              <ul className="list-disc list-inside text-sm ml-2">
                {formData.needs.map((need, index) => (
                  <li key={index}>
                    {t(need.category)} ({t(need.priority)}): {need.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Assistance summary */}
          <div>
            <h5 className="font-medium text-md text-gray-700 mb-2">{t('assistanceRequested')}</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {formData.medical_help?.type_of_medical_assistance_needed?.length > 0 && (
                <div className="bg-blue-50 p-2 rounded">{t('medicalHelp')}</div>
              )}
              
              {formData.food_assistance?.type_of_food_assistance_needed?.length > 0 && (
                <div className="bg-green-50 p-2 rounded">{t('foodAssistance')}</div>
              )}
              
              {formData.marriage_assistance?.marriage_support_needed && (
                <div className="bg-purple-50 p-2 rounded">{t('marriageAssistance')}</div>
              )}
              
              {formData.debt_assistance?.needs_debt_assistance && (
                <div className="bg-red-50 p-2 rounded">{t('debtAssistance')}</div>
              )}
              
              {formData.education_assistance?.children_educational_needs?.length > 0 && (
                <div className="bg-yellow-50 p-2 rounded">{t('educationAssistance')}</div>
              )}
              
              {formData.shelter_assistance?.type_of_housing && (
                <div className="bg-orange-50 p-2 rounded">{t('shelterAssistance')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {!isValid && totalErrors > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h4 className="font-medium text-red-700 mb-2">{t('errorsToFixBefore')}</h4>
          <ul className="list-disc list-inside text-sm text-red-600 ml-2">
            {Object.entries(errorsBySection).map(([section, count]) => {
              if (count > 0) {
                // For assistance section, show detailed field errors
                if (section === 'assistance') {
                  // Map of assistance fields to translation keys
                  const assistanceFields = {
                    medical_help: t('medicalHelp'),
                    food_assistance: t('foodAssistance'),
                    marriage_assistance: t('marriageAssistance'),
                    debt_assistance: t('debtAssistance'),
                    education_assistance: t('educationAssistance'),
                    shelter_assistance: t('shelterAssistance'),
                  };
                  return (
                    <li key={section}>
                      {t('assistanceNeeds')}:
                      <ul className="ml-4 list-disc">
                        {Object.entries(assistanceFields).map(([field, label]) => {
                          if (errors[field]) {
                            // If the error is an object, show its nested messages
                            if (typeof errors[field] === 'object' && errors[field] !== null) {
                              return Object.entries(errors[field]).map(([subField, subError]) => (
                                <li key={subField}>
                                  {label} - {t(subField)}: {subError?.message || t('error')}
                                </li>
                              ));
                            }
                            // Otherwise, just show the main error
                            return (
                              <li key={field}>
                                {label}: {errors[field]?.message || t('error')}
                              </li>
                            );
                          }
                          return null;
                        })}
                      </ul>
                    </li>
                  );
                }
                // Default: show section error count
                return (
                  <li key={section}>
                    {t(`${section}Information`)}: {count} {count === 1 ? t('error') : t('errors')}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 