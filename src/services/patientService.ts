
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Patient {
  id?: string;
  doctor_id: string;
  unique_id: string;
  date_of_birth: string;
  medical_history?: any;
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
    
    let attempts = 0;
    const maxAttempts = 3;
    let createdPatient = null;
    
    while (attempts < maxAttempts && !createdPatient) {
      attempts++;
      
      // Generate a new unique ID if not first attempt
      if (attempts > 1) {
        const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
        patient.unique_id = `PT-${randomId}`;
      }
      
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert(patient)
          .select()
          .single();
          
        if (error) {
          // If it's a duplicate key error, we'll retry with a new ID
          if (error.code === '23505' && attempts < maxAttempts) {
            console.log(`Duplicate ID detected, trying again with new ID: ${patient.unique_id}`);
            continue;
          }
          
          console.error('Error creating patient:', error);
          throw error;
        }
        
        createdPatient = data;
      } catch (innerError) {
        // If this is the last attempt, throw the error
        if (attempts >= maxAttempts) {
          throw innerError;
        }
      }
    }
    
    if (createdPatient) {
      toast({
        title: "Patient created",
        description: `Patient ${patient.unique_id} was successfully added.`,
      });
      return createdPatient;
    } else {
      throw new Error('Failed to create patient after multiple attempts');
    }
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

    if (updates.medical_history) {
      if (typeof updates.medical_history === 'string') {
        try {
          updates.medical_history = JSON.parse(updates.medical_history);
        } catch (e) {
          console.warn('Could not parse medical_history as JSON, saving as object with text property');
          updates.medical_history = { text: updates.medical_history };
        }
      }
      
      console.log('Medical history to be updated:', JSON.stringify(updates.medical_history, null, 2));
      
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
