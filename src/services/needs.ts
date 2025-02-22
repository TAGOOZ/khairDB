import { supabase } from '../lib/supabase';
import { NeedsFormData } from '../types/needs';

export class NeedsError extends Error {
  code: string;
  originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'NeedsError';
    this.code = code;
    this.originalError = originalError;
  }
}

export async function createNeeds(individualId: string, data: NeedsFormData) {
  try {
    const { error } = await supabase
      .from('needs')
      .insert([{
        individual_id: individualId,
        medical_checks: data.medicalChecks,
        medical_descriptions: data.medicalDescriptions,
        chronic_disease: data.chronicDisease,
        treatment_frequency: data.treatmentFrequency,
        treatment_ability: data.treatmentAbility,
        has_health_insurance: data.hasHealthInsurance,
        feeding_status: data.feedingStatus,
        has_supply_card: data.hasSupplyCard,
        marriage_stage: data.marriageStage,
        wedding_date: data.weddingDate,
        marriage_needs: data.marriageNeeds,
        tags: data.selectedTags
      }]);

    if (error) throw new NeedsError('creation-failed', 'Failed to create needs', error);
  } catch (error) {
    if (error instanceof NeedsError) throw error;
    throw new NeedsError('unexpected', 'An unexpected error occurred', error);
  }
}
