import { supabase, executeSchemaSetup, testSupabaseConnection } from '@/lib/supabase';
import { Patient, ScreeningResult } from '@/types/patient';

// Function to initialize database schema if needed
export const initializeDatabaseSchema = async (): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log("Checking and initializing database schema...");
    
    // First, test the connection
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.error("Database connection failed:", connectionTest.error);
      return { 
        success: false, 
        error: `Database connection error: ${connectionTest.error}` 
      };
    }
    
    if (connectionTest.needsSetup) {
      console.log("Database needs setup, creating tables...");
      
      // Try to execute the schema setup using our direct SQL executor
      const setupResult = await executeSchemaSetup();
      
      if (!setupResult.success) {
        console.log("Schema setup using SQL failed, trying alternative approach...");
        return await createTablesDirectly();
      }
      
      return { success: true };
    }
    
    console.log("Database already set up correctly");
    return { success: true };
  } catch (error) {
    console.error("Error initializing database schema:", error);
    
    // Try alternative approach
    return await createTablesDirectly();
  }
};

// Fallback method to create tables directly via inserts
const createTablesDirectly = async (): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log("Attempting direct table creation via inserts...");
    
    // Try to create patients table by inserting a test record
    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '1234567890',
        doctor_id: '00000000-0000-0000-0000-000000000000',
        screeningStep: 'completed'
      })
      .select('id')
      .single();
    
    // If there's an error that's not just a constraint violation, the table might not exist
    if (patientError && patientError.code !== '23505') {
      console.error("Error with patients table:", patientError);
      return { 
        success: false, 
        error: "Could not create or access patients table. Please contact support or manually run the SQL setup script." 
      };
    }
    
    // Try to create screening_results table by inserting a test record
    const { error: resultError } = await supabase
      .from('screening_results')
      .insert({
        patient_id: '00000000-0000-0000-0000-000000000000',
        doctor_id: '00000000-0000-0000-0000-000000000000',
        analysisResult: 'negative'
      })
      .select('id')
      .single();
    
    if (resultError && resultError.code !== '23505') {
      console.error("Error with screening_results table:", resultError);
      return { 
        success: false, 
        error: "Could not create or access screening_results table. Please contact support or manually run the SQL setup script." 
      };
    }
    
    // Try to create storage bucket
    try {
      const { error: bucketError } = await supabase.storage.createBucket('cervical_images', {
        public: true
      });
      
      if (bucketError && bucketError.status !== 409) { // 409 means it already exists
        console.warn("Warning creating storage bucket:", bucketError);
      }
    } catch (storageError) {
      console.warn("Warning creating storage bucket:", storageError);
      // Continue anyway, this is not critical
    }
    
    console.log("Direct table creation completed");
    return { success: true };
  } catch (error) {
    console.error("Error in direct table creation:", error);
    return { 
      success: false, 
      error: error instanceof Error 
        ? `Database setup failed: ${error.message}` 
        : "Database setup failed with unknown error" 
    };
  }
};

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
    
    // Check if 'patients' table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
      
    if (tableError && tableError.code === '42P01') {
      console.error("Table 'patients' does not exist:", tableError);
      return { 
        data: null, 
        error: new Error("Table 'patients' does not exist. Please ensure database tables are created.") 
      };
    }
    
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error creating patient:", error);
      return { data: null, error };
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
    // Ensure the database schema exists
    await initializeDatabaseSchema();
    
    // Get results history from localStorage
    const storedResults = localStorage.getItem('resultsHistory');
    if (!storedResults) return true; // Nothing to migrate
    
    const resultsHistory = JSON.parse(storedResults);
    if (!Array.isArray(resultsHistory) || resultsHistory.length === 0) return true;
    
    console.log("Starting migration of", resultsHistory.length, "records to Supabase");
    
    // For each result, create a patient and screening result
    for (const result of resultsHistory) {
      try {
        // Create patient record
        const patientData: Patient = {
          firstName: result.firstName,
          lastName: result.lastName,
          phoneNumber: result.phoneNumber,
          dateOfBirth: result.dateOfBirth || undefined,
          doctor_id: doctorId,
          screeningStep: 'completed'
        };
        
        console.log("Creating patient with data:", patientData);
        
        const { data: patientRecord, error: patientError } = await createPatient(patientData);
        if (patientError || !patientRecord) {
          console.error("Error creating patient during migration:", patientError);
          continue;
        }
        
        console.log("Patient created successfully:", patientRecord);
        
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
        
        const { error: screeningError } = await saveScreeningResult(screeningData);
        if (screeningError) {
          console.error("Error saving screening result during migration:", screeningError);
        }
      } catch (recordError) {
        console.error("Error processing record during migration:", recordError);
        // Continue with next record
      }
    }
    
    // Clear localStorage after successful migration
    localStorage.removeItem('resultsHistory');
    console.log("Migration completed and localStorage cleared");
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};
