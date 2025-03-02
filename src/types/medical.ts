
export interface MedicalHistoryData {
  sociodemographic?: {
    education?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  lifestyle?: {
    smoking?: string;
    alcohol?: string;
    physicalActivity?: string;
  };
  medical?: {
    conditions?: string[] | string;
    symptoms?: string[] | string;
    reproductiveHistory?: string;
    lastVisaExamResults?: string;
  };
}
