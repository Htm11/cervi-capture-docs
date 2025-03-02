
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface Patient {
  id?: string;
  doctor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number?: string;
  email?: string;
  medical_history?: string;
  created_at?: string;
  updated_at?: string;
}

export const getPatients = async (doctorId: string): Promise<Patient[]> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPatients:', error);
    return [];
  }
};

export const getPatient = async (patientId: string): Promise<Patient | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
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
    return null;
  }
};

export const createPatient = async (patient: Patient): Promise<Patient | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    // Ensure patient has required fields
    if (!patient.first_name || !patient.last_name || !patient.date_of_birth || !patient.doctor_id) {
      console.error('Missing required patient fields');
      throw new Error('First name, last name, date of birth, and doctor ID are required');
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

    console.log('Patient created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createPatient:', error);
    return null;
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<Patient | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
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

    return data;
  } catch (error) {
    console.error('Error in updatePatient:', error);
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

    return true;
  } catch (error) {
    console.error('Error in deletePatient:', error);
    return false;
  }
};
