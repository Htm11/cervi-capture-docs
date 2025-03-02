
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

    // Convert base64 to blob
    const base64Data = imageBase64.split(',')[1];
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    
    // Create a file from the blob
    const fileName = `${doctorId}/${patientId}/${Date.now()}_${imageType}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    console.log(`Uploading ${imageType} image for doctor ${doctorId}, patient ${patientId}`);
    
    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('cervical_images')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('cervical_images')
      .getPublicUrl(data.path);

    console.log(`Successfully uploaded ${imageType} image. Public URL:`, urlData.publicUrl);
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
    // First check if this is a real patient ID already in the database
    if (patientData.id && patientData.id !== 'temp-patient-id') {
      const existingPatient = await getPatient(patientData.id);
      if (existingPatient) {
        return patientData.id;
      }
    }
    
    // If we reach here, we need to create a real patient
    const newPatient = {
      doctor_id: doctorId,
      first_name: patientData.firstName || 'Unknown',
      last_name: patientData.lastName || 'Patient',
      date_of_birth: patientData.dateOfBirth instanceof Date 
        ? patientData.dateOfBirth.toISOString().split('T')[0] 
        : (typeof patientData.dateOfBirth === 'string' 
            ? patientData.dateOfBirth 
            : new Date().toISOString().split('T')[0]),
      contact_number: patientData.phoneNumber || null,
      email: patientData.email || null,
      medical_history: patientData.medicalHistory || null
    };
    
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

    // Ensure doctor_id is set to the current doctor
    const resultWithDoctor = {
      ...result,
      doctor_id: doctor.id
    };
    
    console.log('Saving screening result:', resultWithDoctor);

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
    return null;
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

    console.log('Fetching screening results for doctor:', doctorId);

    const { data, error } = await supabase
      .from('screening_results')
      .select('*, patients!inner(*)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching doctor screening results:', error);
      throw error;
    }

    console.log('Loaded screening results:', data);

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
