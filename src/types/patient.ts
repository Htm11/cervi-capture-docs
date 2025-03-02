
export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  smokingStatus?: string;
  alcoholUse?: string;
  physicalActivity?: string;
  existingConditions?: string[];
  commonSymptoms?: string[];
  reproductiveHistory?: string;
  lastVisaExamResults?: string;
  screeningStep?: 'before-acetic' | 'after-acetic' | 'completed';
  doctor_id: string; // Reference to the doctor who registered the patient
  created_at?: string;
}

export interface ScreeningResult {
  id?: string;
  patient_id: string;
  doctor_id: string;
  analysisResult: 'positive' | 'negative';
  analysisDate: string;
  beforeAceticImage?: string;
  afterAceticImage?: string;
  notes?: string;
  created_at?: string;
}
