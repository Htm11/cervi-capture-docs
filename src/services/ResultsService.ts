
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
    
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .single();
    
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
 * Save screening result with better validation and error handling
 */
export const saveScreeningResult = async (
  result: ScreeningResult,
  doctor: Doctor
): Promise<ScreeningResult | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    if (!result.patient_id) {
      console.error('Missing patient_id in screening result:', result);
      throw new Error('Missing patient information. Please register the patient again.');
    }

    if (!doctor || !doctor.id) {
      console.error('Missing doctor information:', doctor);
      throw new Error('Missing doctor information. Please log in again.');
    }

    // Verify patient exists
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

    return {
      ...data,
      result: data.result as 'positive' | 'negative'
    } as ScreeningResult;
  } catch (error) {
    console.error('Error in saveScreeningResult:', error);
    throw error;
  }
};
