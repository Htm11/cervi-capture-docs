
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Doctor } from '@/types/auth';
import { getPatient, createPatient } from './patientService';
import { isValidUUID } from '@/utils/ImageUtils';
import { 
  uploadScreeningImage, 
  saveScreeningResult, 
  verifyPatientExists,
  getPatientIdByDetails 
} from './ResultsService';

// Re-export functions from ResultsService for backward compatibility
export { 
  uploadScreeningImage, 
  saveScreeningResult, 
  verifyPatientExists,
  getPatientIdByDetails 
};

export interface ScreeningResult {
  id?: string;
  patient_id: string;
  doctor_id: string;
  before_image_url?: string;
  after_image_url?: string;
  image_url?: string;
  result: 'positive' | 'negative';
  confidence?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  patients?: any; // Add this to handle the joined data
}

/**
 * Check if patient exists and create if needed
 * Now with better error handling and data validation
 */
export const ensurePatientExists = async (
  patientData: any,
  doctorId: string
): Promise<string> => {
  try {
    console.log("Ensuring patient exists with data:", JSON.stringify(patientData, null, 2));
    
    // Validate patientData
    if (!patientData) {
      throw new Error('No patient data provided');
    }
    
    if (!doctorId) {
      throw new Error('No doctor ID provided');
    }
    
    // Check if valid patient ID is provided and exists in database
    if (patientData.id && patientData.id !== 'temp-patient-id' && isValidUUID(patientData.id)) {
      console.log("Checking for existing patient with ID:", patientData.id);
      
      const patientExists = await verifyPatientExists(patientData.id);
      
      if (patientExists) {
        console.log("Found existing patient with ID:", patientData.id);
        return patientData.id;
      } else {
        console.log("Patient ID not found in database:", patientData.id);
      }
    } else {
      console.log("No valid patient ID provided, trying to find by details...");
      
      // Try to find patient by name and DOB if ID is not valid
      const firstName = patientData.firstName || patientData.first_name || '';
      const lastName = patientData.lastName || patientData.last_name || '';
      const dateOfBirth = patientData.dateOfBirth instanceof Date 
        ? patientData.dateOfBirth.toISOString().split('T')[0] 
        : (typeof patientData.dateOfBirth === 'string' 
            ? patientData.dateOfBirth 
            : (patientData.date_of_birth || ''));
      
      if (firstName && lastName && dateOfBirth) {
        const existingPatientId = await getPatientIdByDetails(firstName, lastName, dateOfBirth, doctorId);
        
        if (existingPatientId) {
          console.log("Found patient by details, using ID:", existingPatientId);
          return existingPatientId;
        }
      }
    }
    
    // Create new patient with standardized data
    const newPatient = {
      doctor_id: doctorId,
      first_name: patientData.firstName || patientData.first_name || 'Unknown',
      last_name: patientData.lastName || patientData.last_name || 'Patient',
      date_of_birth: patientData.dateOfBirth instanceof Date 
        ? patientData.dateOfBirth.toISOString().split('T')[0] 
        : (typeof patientData.dateOfBirth === 'string' 
            ? patientData.dateOfBirth 
            : (patientData.date_of_birth || new Date().toISOString().split('T')[0])),
      contact_number: patientData.phoneNumber || patientData.contact_number || null,
      email: patientData.email || null,
      medical_history: typeof patientData.medicalHistory === 'object' 
        ? JSON.stringify(patientData.medicalHistory) 
        : (patientData.medicalHistory || patientData.medical_history || null)
    };
    
    console.log("Creating new patient with data:", newPatient);
    const createdPatient = await createPatient(newPatient);
    if (createdPatient && createdPatient.id) {
      console.log('Created new patient with ID:', createdPatient.id);
      return createdPatient.id;
    } else {
      throw new Error('Failed to create patient');
    }
  } catch (error) {
    console.error('Error in ensurePatientExists:', error);
    throw error;
  }
};

// Get screening results for a specific patient
export const getPatientScreeningResults = async (
  patientId: string
): Promise<ScreeningResult[]> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }

    if (!patientId || !isValidUUID(patientId)) {
      console.error('Invalid patient ID provided:', patientId);
      return [];
    }

    const { data, error } = await supabase
      .from('screening_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching screening results:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      result: item.result as 'positive' | 'negative'
    })) as ScreeningResult[];
  } catch (error) {
    console.error('Error in getPatientScreeningResults:', error);
    return [];
  }
};

// Get all screening results for the current doctor
export const getDoctorScreeningResults = async (
  doctorId: string
): Promise<ScreeningResult[]> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }

    if (!doctorId) {
      console.error('No doctor ID provided');
      return [];
    }

    const { data, error } = await supabase
      .from('screening_results')
      .select('*, patients!inner(*)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching doctor screening results:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      result: item.result as 'positive' | 'negative'
    })) as ScreeningResult[];
  } catch (error) {
    console.error('Error in getDoctorScreeningResults:', error);
    return [];
  }
};

// Delete a screening result
export const deleteScreeningResult = async (resultId: string): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return false;
    }

    if (!resultId) {
      console.error('No result ID provided');
      return false;
    }

    const { error } = await supabase
      .from('screening_results')
      .delete()
      .eq('id', resultId);

    if (error) {
      console.error('Error deleting screening result:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteScreeningResult:', error);
    return false;
  }
};
