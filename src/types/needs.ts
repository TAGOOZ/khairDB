export interface NeedsFormData {
  medicalChecks: {
    examination: boolean;
    tests: boolean;
    xrays: boolean;
    operations: boolean;
  };
  medicalDescriptions: {
    examination: string;
    tests: string;
    xrays: string;
    operations: string;
  };
  chronicDisease: string;
  treatmentFrequency: string;
  treatmentAbility: string;
  hasHealthInsurance: string;
  feedingStatus: string;
  hasSupplyCard: boolean;
  marriageStage: string;
  weddingDate: string;
  marriageNeeds: string;
  selectedTags: string[];
}