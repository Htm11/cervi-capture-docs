
import { supabase } from '@/lib/supabase';
import { Doctor } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { ScreeningResult } from './screeningService';
import { createFileFromBase64, processBase64Image, isValidUUID } from '@/utils/ImageUtils';

/**
 * Upload an image to Supabase Storage
 */
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

    // Validate inputs
    if (!doctorId) {
      console.error('Missing doctor ID for image upload');
      return null;
    }

    if (!patientId) {
      console.error('Missing patient ID for image upload');
      return null;
    }

    if (!isValidUUID(patientId)) {
      console.error('Invalid patient ID format:', patientId);
      return null;
    }

    // Process the base64 image
    const base64Data = processBase64Image(imageBase64);
    if (!base64Data) {
      return null;
    }
    
    // Create file name with timestamp to prevent conflicts
    const fileName = `${doctorId}/${patientId}/${Date.now()}_${imageType}.jpg`;
    
    // Create file from base64
    const file = await createFileFromBase64(base64Data, fileName);
    if (!file) {
      console.error('Failed to create file from base64 data');
      return null;
    }
    
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

    // Get public URL
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

/**
 * Verify patient exists in database
 */
export const verifyPatientExists = async (patientId: string): Promise<boolean> => {
  try {
    if (!patientId || !isValidUUID(patientId)) {
      console.error('Invalid patient ID provided for verification:', patientId);
      return false;
    }
    
    // Use maybeSingle instead of single for better error handling
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .maybeSingle();
    
    if (error) {
      console.error('Error verifying patient exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in verifyPatientExists:', error);
    return false;
  }
};

/**
 * Directly get patient ID from database by first name, last name and date of birth
 * This is a fallback method when UUID lookup fails
 */
export const getPatientIdByDetails = async (
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  doctorId: string
): Promise<string | null> => {
  try {
    if (!firstName || !lastName || !dateOfBirth || !doctorId) {
      console.error('Missing patient details for lookup');
      return null;
    }

    console.log(`Looking up patient by details: ${firstName} ${lastName}, DOB: ${dateOfBirth}`);
    
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .eq('date_of_birth', dateOfBirth)
      .eq('doctor_id', doctorId)
      .maybeSingle();
    
    if (error) {
      console.error('Error looking up patient by details:', error);
      return null;
    }
    
    if (data) {
      console.log('Found patient by details, ID:', data.id);
      return data.id;
    }
    
    console.log('No patient found with these details');
    return null;
  } catch (error) {
    console.error('Error in getPatientIdByDetails:', error);
    return null;
  }
};

/**
 * Save screening result with better validation and error handling
 */
export const saveScreeningResult = async (
  result: ScreeningResult,
  doctor: Doctor
): Promise<ScreeningResult | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Database connection not available');
    }

    if (!doctor?.id) {
      console.error('Missing doctor information:', doctor);
      throw new Error('Missing doctor information. Please log in again.');
    }

    // Enhanced patient_id validation
    if (!result.patient_id) {
      console.error('Missing patient_id in screening result:', result);
      throw new Error('Missing patient information. Please register the patient again.');
    }

    if (!isValidUUID(result.patient_id)) {
      console.error('Invalid patient_id format:', result.patient_id);
      throw new Error('Invalid patient ID format. Please register the patient again.');
    }

    // Double check patient exists with more detailed error reporting
    const patientExists = await verifyPatientExists(result.patient_id);
    if (!patientExists) {
      console.error('Patient does not exist in database:', result.patient_id);
      throw new Error('Patient does not exist in database. Please register the patient again.');
    }

    console.log('Saving screening result with data:', { 
      patient_id: result.patient_id, 
      doctor_id: doctor.id,
      result: result.result,
      confidence: result.confidence,
      before_image_url: result.before_image_url ? 'present' : 'missing',
      after_image_url: result.after_image_url ? 'present' : 'missing'
    });

    // Make sure we have all required fields
    const resultWithDoctor = {
      patient_id: result.patient_id,
      doctor_id: doctor.id,
      result: result.result,
      confidence: result.confidence || 0.5,
      before_image_url: result.before_image_url || null,
      after_image_url: result.after_image_url || null,
      notes: result.notes || `Screening performed on ${new Date().toLocaleDateString()}`
    };

    // Insert the result and return the inserted row
    const { data, error } = await supabase
      .from('screening_results')
      .insert(resultWithDoctor)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving screening result:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned after inserting screening result');
      throw new Error('Failed to save screening result');
    }

    console.log('Screening result saved successfully:', data);

    return {
      ...data,
      result: data.result as 'positive' | 'negative'
    } as ScreeningResult;
  } catch (error) {
    console.error('Error in saveScreeningResult:', error);
    throw error;
  }
};
