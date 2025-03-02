
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
  medical_history?: string;
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
