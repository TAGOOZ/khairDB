import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IndividualFormData } from '../../../schemas/individualSchema';

// Assistance section component for expandable sections
interface AssistanceSectionProps {
  title: string;
  description?: string;
  isOpen: boolean;
  toggleOpen: () => void;
  children: React.ReactNode;
}

function AssistanceSection({ 
  title, 
  description, 
  isOpen, 
  toggleOpen, 
  children 
}: AssistanceSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <div>
          <h3 className="text-md font-medium text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

export function AssistanceStep() {
  const { t } = useLanguage();
  const { register, watch, formState: { errors }, setValue } = useFormContext<IndividualFormData>();
  
  // Track which sections are open
  const [openSections, setOpenSections] = useState({
    medical: true,
    food: false,
    marriage: false,
    debt: false,
    education: false,
    shelter: false
  });
  
  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Watch debt assistance status to show conditional fields
  const needsDebtAssistance = watch('debt_assistance.needs_debt_assistance');
  
  // Watch marriage assistance status to show conditional fields
  const needsMarriageAssistance = watch('marriage_assistance.marriage_support_needed');
  const weddingContractSigned = watch('marriage_assistance.wedding_contract_signed');
  
  // Watch medical assistance to validate meaningful selection
  const medicalAssistanceTypes = watch('medical_help.type_of_medical_assistance_needed') || [];
  
  
  
  // Clear debt fields when needs_debt_assistance is unchecked
  React.useEffect(() => {
    if (!needsDebtAssistance) {
      setValue('debt_assistance.debt_amount', 0);
      setValue('debt_assistance.household_appliances', false);
      setValue('debt_assistance.hospital_bills', false);
      setValue('debt_assistance.education_fees', false);
      setValue('debt_assistance.business_debt', false);
      setValue('debt_assistance.other_debt', false);
    }
  }, [needsDebtAssistance, setValue]);
  
  // Clear marriage fields when marriage_support_needed is unchecked
  React.useEffect(() => {
    if (!needsMarriageAssistance) {
      setValue('marriage_assistance.wedding_contract_signed', false);
      setValue('marriage_assistance.wedding_date', '');
      setValue('marriage_assistance.specific_needs', '');
    }
  }, [needsMarriageAssistance, setValue]);

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        {t('assistanceDescription')}
      </p>
      
      {/* Medical Assistance Section */}
      <AssistanceSection
        title={t('medicalHelp')}
        isOpen={openSections.medical}
        toggleOpen={() => toggleSection('medical')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('typeOfMedicalAssistance')}</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="Medical Checkup" 
                  className="mr-2"
                />
                <span>{t('medicalCheckup')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="Lab Tests" 
                  className="mr-2"
                />
                <span>{t('labTests')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="X-rays/Scans" 
                  className="mr-2"
                />
                <span>{t('xraysScans')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="Surgeries" 
                  className="mr-2"
                />
                <span>{t('surgeries')}</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('medicationDistributionFrequency')}</label>
              <select 
                {...register('medical_help.medication_distribution_frequency')} 
                className="w-full p-2 border rounded-md border-gray-300"
              >
                <option value="">{t('choose')}</option>
                <option value="Monthly">{t('monthly')}</option>
                <option value="Intermittent">{t('intermittent')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('estimatedCostOfTreatment')}</label>
              <select 
                {...register('medical_help.estimated_cost_of_treatment')} 
                className="w-full p-2 border rounded-md border-gray-300"
              >
                <option value="">{t('choose')}</option>
                <option value="Able">{t('ableToAfford')}</option>
                <option value="Unable">{t('unableToAfford')}</option>
                <option value="Partially">{t('partiallyAble')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('medical_help.health_insurance_coverage')} 
                className="mr-2"
              />
              <span>{t('healthInsuranceCoverage')}</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('additionalDetails')}</label>
            <textarea 
              {...register('medical_help.additional_details')} 
              className="w-full p-2 border rounded-md border-gray-300" 
              placeholder={t('additionalMedicalDetails')}
              rows={3}
            />
          </div>
        </div>
      </AssistanceSection>
      
      {/* Food Assistance Section */}
      <AssistanceSection
        title={t('foodAssistance')}
        isOpen={openSections.food}
        toggleOpen={() => toggleSection('food')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('typeOfFoodAssistance')}</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('food_assistance.type_of_food_assistance_needed')} 
                  value="Ready-made meals" 
                  className="mr-2"
                />
                <span>{t('readyMadeMeals')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('food_assistance.type_of_food_assistance_needed')} 
                  value="Non-ready meals" 
                  className="mr-2"
                />
                <span>{t('nonReadyMeals')}</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('food_assistance.food_supply_card')} 
                className="mr-2"
              />
              <span>{t('foodSupplyCard')}</span>
            </label>
          </div>
        </div>
      </AssistanceSection>
      
      {/* Marriage Assistance Section */}
      <AssistanceSection
        title={t('marriageAssistance')}
        isOpen={openSections.marriage}
        toggleOpen={() => toggleSection('marriage')}
      >
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('marriage_assistance.marriage_support_needed')} 
                className="mr-2"
              />
              <span>{t('marriageSupportNeeded')}</span>
            </label>
          </div>
          
          {needsMarriageAssistance && (
            <div className="animate-fadeIn space-y-4">
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    {...register('marriage_assistance.wedding_contract_signed')} 
                    className="mr-2"
                  />
                  <span>{t('weddingContractSigned')}</span>
                </label>
              </div>
              
              {weddingContractSigned && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium mb-1">{t('weddingDate')}</label>
                  <input 
                    type="date" 
                    {...register('marriage_assistance.wedding_date')} 
                    className="w-full p-2 border rounded-md border-gray-300"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">{t('specificNeeds')}</label>
                <textarea 
                  {...register('marriage_assistance.specific_needs')} 
                  className="w-full p-2 border rounded-md border-gray-300" 
                  placeholder={t('whatAreTheNeeds')}
                  rows={3}
                  disabled={!needsMarriageAssistance || !weddingContractSigned}
                />
              </div>
            </div>
          )}
        </div>
      </AssistanceSection>
      
      {/* Debt Assistance Section */}
      <AssistanceSection
        title={t('debtAssistance')}
        isOpen={openSections.debt}
        toggleOpen={() => toggleSection('debt')}
      >
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('debt_assistance.needs_debt_assistance')} 
                className="mr-2"
                disabled={!needsMarriageAssistance}
              />
              <span>{t('needsDebtAssistance')}</span>
            </label>
          </div>
          
          {needsDebtAssistance && (
            <div className="animate-fadeIn space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('debtAmount')}</label>
                <input 
                  type="number" 
                  {...register('debt_assistance.debt_amount', {
                    setValueAs: (value) => value === "" ? 0 : Number(value),
                    required: needsDebtAssistance ? "Debt amount is required when debt assistance is needed" : false,
                    min: needsDebtAssistance ? { value: 1, message: "Debt amount must be greater than 0" } : undefined
                  })} 
                  className="w-full p-2 border rounded-md border-gray-300" 
                  placeholder="0"
                  min="0"
                  disabled={!needsDebtAssistance}
                />
                {errors.debt_assistance?.debt_amount && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {errors.debt_assistance.debt_amount.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('debtType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...register('debt_assistance.household_appliances')} 
                      className="mr-2"
                      disabled={!needsDebtAssistance}
                    />
                    <span>{t('householdAppliances')}</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...register('debt_assistance.hospital_bills')} 
                      className="mr-2"
                      disabled={!needsDebtAssistance}
                    />
                    <span>{t('hospitalBills')}</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...register('debt_assistance.education_fees')} 
                      className="mr-2"
                      disabled={!needsDebtAssistance}
                    />
                    <span>{t('educationFees')}</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...register('debt_assistance.business_debt')} 
                      className="mr-2"
                      disabled={!needsDebtAssistance}
                    />
                    <span>{t('businessDebt')}</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...register('debt_assistance.other_debt')} 
                      className="mr-2"
                      disabled={!needsDebtAssistance}
                    />
                    <span>{t('otherDebt')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </AssistanceSection>
      
      {/* Education Assistance Section */}
      <AssistanceSection
        title={t('educationAssistance')}
        isOpen={openSections.education}
        toggleOpen={() => toggleSection('education')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('familyEducationLevel')}</label>
            <select 
              {...register('education_assistance.family_education_level')} 
              className="w-full p-2 border rounded-md border-gray-300"
            >
              <option value="">{t('choose')}</option>
              <option value="Higher Education">{t('higherEducation')}</option>
              <option value="Intermediate Education">{t('intermediateEducation')}</option>
              <option value="Literate">{t('literate')}</option>
              <option value="Illiterate">{t('illiterate')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('desireForEducation')}</label>
            <input 
              type="text" 
              {...register('education_assistance.desire_for_education')} 
              className="w-full p-2 border rounded-md border-gray-300" 
              placeholder={t('whatIsDesireForEducation')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('childrenEducationalNeeds')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Tuition Fees" 
                  className="mr-2"
                />
                <span>{t('tuitionFees')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="School Uniforms" 
                  className="mr-2"
                />
                <span>{t('schoolUniforms')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Books" 
                  className="mr-2"
                />
                <span>{t('books')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Supplies" 
                  className="mr-2"
                />
                <span>{t('supplies')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Tutoring" 
                  className="mr-2"
                />
                <span>{t('tutoring')}</span>
              </label>
            </div>
          </div>
        </div>
      </AssistanceSection>
      
      {/* Shelter Assistance Section */}
      <AssistanceSection
        title={t('shelterAssistance')}
        isOpen={openSections.shelter}
        toggleOpen={() => toggleSection('shelter')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('typeOfHousing')}</label>
              <select 
                {...register('shelter_assistance.type_of_housing')} 
                className="w-full p-2 border rounded-md border-gray-300"
              >
                <option value="">{t('choose')}</option>
                <option value="Owned">{t('owned')}</option>
                <option value="New Rental">{t('newRental')}</option>
                <option value="Old Rental">{t('oldRental')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('housingCondition')}</label>
              <select 
                {...register('shelter_assistance.housing_condition')} 
                className="w-full p-2 border rounded-md border-gray-300"
              >
                <option value="">{t('choose')}</option>
                <option value="Healthy">{t('healthy')}</option>
                <option value="Moderate">{t('moderate')}</option>
                <option value="Unhealthy">{t('unhealthy')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('numberOfRooms')}</label>
            <input 
              type="number" 
              {...register('shelter_assistance.number_of_rooms', {
                valueAsNumber: true
              })} 
              className="w-full p-2 border rounded-md border-gray-300" 
              placeholder="1"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('householdAppliances')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Stove" 
                  className="mr-2"
                />
                <span>{t('stove')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Manual Washing Machine" 
                  className="mr-2"
                />
                <span>{t('manualWashingMachine')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Automatic Washing Machine" 
                  className="mr-2"
                />
                <span>{t('automaticWashingMachine')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Refrigerator" 
                  className="mr-2"
                />
                <span>{t('refrigerator')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Fan" 
                  className="mr-2"
                />
                <span>{t('fan')}</span>
              </label>
            </div>
          </div>
        </div>
      </AssistanceSection>
    </div>
  );
} 
