
import { supabase } from '@/lib/supabase';
import { Patient, ScreeningResult } from '@/types/patient';

// Patient CRUD operations
export const createPatient = async (patientData: Patient): Promise<{ data: Patient | null, error: any }> => {
  try {
    console.log("Creating patient with data:", patientData);
    
    // Validate required fields
    if (!patientData.firstName || !patientData.lastName || !patientData.phoneNumber || !patientData.doctor_id) {
      console.error("Missing required fields for patient creation");
      return { 
        data: null, 
        error: new Error("Missing required fields: firstName, lastName, phoneNumber and doctor_id are required") 
      };
    }
    
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error creating patient:", error);
      throw error;
    }
    
    console.log("Patient created successfully:", data);
    return { data, error: null };
  } catch (error) {
    console.error('Error creating patient:', error);
    return { data: null, error };
  }
};

export const getPatientById = async (patientId: string): Promise<{ data: Patient | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching patient:', error);
    return { data: null, error };
  }
};

export const getPatientsByDoctor = async (doctorId: string): Promise<{ data: Patient[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { data: null, error };
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<{ data: Patient | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', patientId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating patient:', error);
    return { data: null, error };
  }
};

// Screening results operations
export const saveScreeningResult = async (resultData: ScreeningResult): Promise<{ data: ScreeningResult | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('screening_results')
      .insert([resultData])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error saving screening result:', error);
    return { data: null, error };
  }
};

export const getPatientResults = async (patientId: string): Promise<{ data: ScreeningResult[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('screening_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching patient results:', error);
    return { data: null, error };
  }
};

export const getResultsByDoctor = async (doctorId: string): Promise<{ data: ScreeningResult[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('screening_results')
      .select(`
        *,
        patients (
          firstName, 
          lastName,
          phoneNumber,
          dateOfBirth
        )
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching doctor results:', error);
    return { data: null, error };
  }
};

// Storage operations for images
export const uploadImage = async (
  file: string,
  filePath: string
): Promise<{ url: string | null; error: any }> => {
  try {
    // Convert base64 to blob
    const base64Data = file.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('cervical_images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cervical_images')
      .getPublicUrl(filePath);
      
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error };
  }
};

// Migration helper - for migrating from localStorage to Supabase
export const migrateLocalStorageToSupabase = async (doctorId: string): Promise<boolean> => {
  try {
    // Get results history from localStorage
    const storedResults = localStorage.getItem('resultsHistory');
    if (!storedResults) return true; // Nothing to migrate
    
    const resultsHistory = JSON.parse(storedResults);
    if (!Array.isArray(resultsHistory) || resultsHistory.length === 0) return true;
    
    // For each result, create a patient and screening result
    for (const result of resultsHistory) {
      // Create patient record
      const patientData: Patient = {
        firstName: result.firstName,
        lastName: result.lastName,
        phoneNumber: result.phoneNumber,
        dateOfBirth: result.dateOfBirth || undefined,
        doctor_id: doctorId,
        screeningStep: 'completed'
      };
      
      const { data: patientRecord, error: patientError } = await createPatient(patientData);
      if (patientError || !patientRecord) continue;
      
      // Upload images if they exist
      let beforeImageUrl = null;
      let afterImageUrl = null;
      
      if (result.beforeAceticImage) {
        const { url } = await uploadImage(
          result.beforeAceticImage,
          `${doctorId}/${patientRecord.id}/before-acetic-${new Date().getTime()}.jpg`
        );
        beforeImageUrl = url;
      }
      
      if (result.afterAceticImage) {
        const { url } = await uploadImage(
          result.afterAceticImage,
          `${doctorId}/${patientRecord.id}/after-acetic-${new Date().getTime()}.jpg`
        );
        afterImageUrl = url;
      }
      
      // Create screening result
      const screeningData: ScreeningResult = {
        patient_id: patientRecord.id!,
        doctor_id: doctorId,
        analysisResult: result.analysisResult === 'positive' ? 'positive' : 'negative',
        analysisDate: result.analysisDate || new Date().toISOString(),
        beforeAceticImage: beforeImageUrl || undefined,
        afterAceticImage: afterImageUrl || undefined
      };
      
      await saveScreeningResult(screeningData);
    }
    
    // Clear localStorage after successful migration
    localStorage.removeItem('resultsHistory');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};
