
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface ScreeningResult {
  id?: string;
  patient_id: string;
  doctor_id: string;
  image_url?: string;
  result: string;
  confidence?: number;
  notes?: string;
}

export const uploadScreeningImage = async (
  file: File,
  doctorId: string,
  patientId: string
): Promise<string | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    const fileName = `${doctorId}/${patientId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from('cervical_images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: urlData } = supabase
      .storage
      .from('cervical_images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadScreeningImage:', error);
    toast({
      title: "Error uploading image",
      description: "Could not upload the screening image. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

export const saveScreeningResult = async (
  result: ScreeningResult
): Promise<ScreeningResult | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    const { data, error } = await supabase
      .from('screening_results')
      .insert(result)
      .select()
      .single();

    if (error) {
      console.error('Error saving screening result:', error);
      throw error;
    }

    toast({
      title: "Result saved",
      description: "Screening result was successfully saved.",
    });

    return data;
  } catch (error) {
    console.error('Error in saveScreeningResult:', error);
    toast({
      title: "Error saving result",
      description: "Could not save the screening result. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

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

    return data || [];
  } catch (error) {
    console.error('Error in getPatientScreeningResults:', error);
    toast({
      title: "Error fetching results",
      description: "Could not retrieve the screening results. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

export const getAllScreeningResults = async (): Promise<ScreeningResult[]> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }

    const { data, error } = await supabase
      .from('screening_results')
      .select('*, patients!inner(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all screening results:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllScreeningResults:', error);
    toast({
      title: "Error fetching results",
      description: "Could not retrieve screening results. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

export const updateScreeningResult = async (
  resultId: string,
  updates: Partial<ScreeningResult>
): Promise<ScreeningResult | null> => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    const { data, error } = await supabase
      .from('screening_results')
      .update(updates)
      .eq('id', resultId)
      .select()
      .single();

    if (error) {
      console.error('Error updating screening result:', error);
      throw error;
    }

    toast({
      title: "Result updated",
      description: "Screening result was successfully updated.",
    });

    return data;
  } catch (error) {
    console.error('Error in updateScreeningResult:', error);
    toast({
      title: "Error updating result",
      description: "Could not update the screening result. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};
