
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Patient {
  id?: string;
  doctor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number?: string;
  email?: string;
  medical_history?: any; // Changed from string to any to support JSON
}

export const getPatients = async (): Promise<Patient[]> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPatients:', error);
    toast({
      title: "Error fetching patients",
      description: "Could not retrieve patient data. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

export const getPatient = async (patientId: string): Promise<Patient | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    // Check if patientId is a valid UUID before querying
    if (!patientId || patientId === 'temp-patient-id' || patientId.length < 36) {
      console.warn('Invalid patient ID provided:', patientId);
      return null;
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPatient:', error);
    toast({
      title: "Error fetching patient",
      description: "Could not retrieve the patient data. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

export const createPatient = async (patient: Patient): Promise<Patient | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    // Ensure date_of_birth is a valid date string
    if (!patient.date_of_birth || patient.date_of_birth === 'Invalid Date') {
      patient.date_of_birth = new Date().toISOString().split('T')[0];
    }

    // Ensure medical_history is a valid JSON object if it exists
    if (patient.medical_history) {
      // If it's a string, try to parse it as JSON
      if (typeof patient.medical_history === 'string') {
        try {
          patient.medical_history = JSON.parse(patient.medical_history);
        } catch (e) {
          console.warn('Could not parse medical_history as JSON, saving as object with text property');
          patient.medical_history = { text: patient.medical_history };
        }
      }
      
      // Log the medical history to validate data structure before saving
      console.log('Medical history to be saved:', JSON.stringify(patient.medical_history, null, 2));
      
      // Ensure conditions and symptoms are properly structured
      if (patient.medical_history.medical && Array.isArray(patient.medical_history.medical.conditions)) {
        console.log('Conditions found:', patient.medical_history.medical.conditions);
      }
      
      if (patient.medical_history.medical && Array.isArray(patient.medical_history.medical.symptoms)) {
        console.log('Symptoms found:', patient.medical_history.medical.symptoms);
      }
    }

    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      throw error;
    }

    toast({
      title: "Patient created",
      description: `${patient.first_name} ${patient.last_name} was successfully added.`,
    });

    return data;
  } catch (error) {
    console.error('Error in createPatient:', error);
    toast({
      title: "Error creating patient",
      description: "Could not create patient. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<Patient | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    // Ensure medical_history is a valid JSON object if it exists
    if (updates.medical_history) {
      // If it's a string, try to parse it as JSON
      if (typeof updates.medical_history === 'string') {
        try {
          updates.medical_history = JSON.parse(updates.medical_history);
        } catch (e) {
          console.warn('Could not parse medical_history as JSON, saving as object with text property');
          updates.medical_history = { text: updates.medical_history };
        }
      }
      
      // Log the medical history to validate data structure before updating
      console.log('Medical history to be updated:', JSON.stringify(updates.medical_history, null, 2));
      
      // Ensure conditions and symptoms are properly structured
      if (updates.medical_history.medical && Array.isArray(updates.medical_history.medical.conditions)) {
        console.log('Conditions found:', updates.medical_history.medical.conditions);
      }
      
      if (updates.medical_history.medical && Array.isArray(updates.medical_history.medical.symptoms)) {
        console.log('Symptoms found:', updates.medical_history.medical.symptoms);
      }
    }

    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', patientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      throw error;
    }

    toast({
      title: "Patient updated",
      description: "Patient information was successfully updated.",
    });

    return data;
  } catch (error) {
    console.error('Error in updatePatient:', error);
    toast({
      title: "Error updating patient",
      description: "Could not update patient information. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

export const deletePatient = async (patientId: string): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return false;
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }

    toast({
      title: "Patient deleted",
      description: "Patient was successfully removed from your records.",
    });

    return true;
  } catch (error) {
    console.error('Error in deletePatient:', error);
    toast({
      title: "Error deleting patient",
      description: "Could not delete patient. Please try again later.",
      variant: "destructive",
    });
    return false;
  }
};
