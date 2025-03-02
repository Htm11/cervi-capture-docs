import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Doctor } from '@/types/auth';
import { getPatient, createPatient } from './patientService';

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

// Upload an image to Supabase Storage
export const uploadScreeningImage = async (
  imageBase64: string,
  doctorId: string,
  patientId: string,
  imageType: 'before' | 'after'
): Promise<string | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    if (!imageBase64) {
      console.error('No image data provided');
      return null;
    }

    if (!doctorId || !patientId) {
      console.error('Missing doctor or patient ID', { doctorId, patientId });
      return null;
    }

    // Check if patientId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      console.error('Invalid patient ID format:', patientId);
      return null;
    }

    // Convert base64 to blob
    let base64Data = imageBase64;
    
    // Check if the base64 string contains the data URL prefix
    if (base64Data.includes(',')) {
      base64Data = imageBase64.split(',')[1];
    }
    
    if (!base64Data) {
      console.error('Invalid base64 data');
      return null;
    }

    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    
    // Create a file from the blob
    const fileName = `${doctorId}/${patientId}/${Date.now()}_${imageType}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    console.log(`Uploading ${imageType} image, size: ${file.size} bytes, patient ID: ${patientId}`);
    
    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('cervical_images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    console.log(`${imageType} image uploaded successfully:`, data);

    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('cervical_images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadScreeningImage:', error);
    return null;
  }
};

// Check if patient exists and create if needed
export const ensurePatientExists = async (
  patientData: any,
  doctorId: string
): Promise<string> => {
  try {
    console.log("Ensuring patient exists with data:", JSON.stringify(patientData, null, 2));
    
    // Check if this is a real patient ID already in the database
    if (patientData.id && patientData.id !== 'temp-patient-id') {
      console.log("Checking for existing patient with ID:", patientData.id);
      const existingPatient = await getPatient(patientData.id);
      if (existingPatient) {
        console.log("Found existing patient:", existingPatient);
        return patientData.id;
      } else {
        console.log("Patient ID provided but not found in database:", patientData.id);
      }
    } else {
      console.log("No valid patient ID provided, need to create a new patient");
    }
    
    // If we reach here, we need to create a real patient
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

// Save screening result to the database
export const saveScreeningResult = async (
  result: ScreeningResult,
  doctor: Doctor
): Promise<ScreeningResult | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    // Validate required fields
    if (!result.patient_id) {
      console.error('Missing patient_id in screening result:', result);
      throw new Error('Missing patient information. Please register the patient again.');
    }

    if (!doctor || !doctor.id) {
      console.error('Missing doctor information:', doctor);
      throw new Error('Missing doctor information. Please log in again.');
    }

    console.log('Saving screening result with data:', { 
      patient_id: result.patient_id, 
      doctor_id: doctor.id,
      result: result.result,
      confidence: result.confidence 
    });

    // Ensure doctor_id is set to the current doctor
    const resultWithDoctor = {
      ...result,
      doctor_id: doctor.id
    };

    const { data, error } = await supabase
      .from('screening_results')
      .insert(resultWithDoctor)
      .select()
      .single();

    if (error) {
      console.error('Error saving screening result:', error);
      throw error;
    }

    console.log('Screening result saved successfully:', data);

    // Ensure the result is cast to the correct type
    return {
      ...data,
      result: data.result as 'positive' | 'negative'
    } as ScreeningResult;
  } catch (error) {
    console.error('Error in saveScreeningResult:', error);
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

    const { data, error } = await supabase
      .from('screening_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching screening results:', error);
      throw error;
    }

    // Cast all results to the correct type
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

    const { data, error } = await supabase
      .from('screening_results')
      .select('*, patients!inner(*)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching doctor screening results:', error);
      throw error;
    }

    // Cast all results to the correct type
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
