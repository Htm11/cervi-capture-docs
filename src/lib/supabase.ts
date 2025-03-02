
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with provided credentials
const supabaseUrl = 'https://lksrlstiabxjoxfkgdat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3Jsc3RpYWJ4am94ZmtnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDI5NTMsImV4cCI6MjA1NjQ3ODk1M30.jXyjs00Tat9Tfn_9VlGuZthZb_5slJHPF7C_zHM9X2M';

// Create a function to check if Supabase credentials are valid
export const hasValidSupabaseCredentials = () => {
  return supabaseUrl && supabaseAnonKey;
};

// Initialize Supabase client
let supabase;
if (hasValidSupabaseCredentials()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
} else {
  console.warn('Supabase credentials not found or incomplete. Using mock authentication.');
}

// Directly execute SQL for database setup
export const executeSchemaSetup = async () => {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }
  
  try {
    console.log('Starting direct SQL schema setup...');
    
    // Create patients table
    const patientsResult = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS patients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "phoneNumber" TEXT NOT NULL,
          "dateOfBirth" TIMESTAMP,
          education TEXT,
          occupation TEXT,
          "maritalStatus" TEXT,
          "smokingStatus" TEXT,
          "alcoholUse" TEXT,
          "physicalActivity" TEXT,
          "existingConditions" TEXT[],
          "commonSymptoms" TEXT[],
          "reproductiveHistory" TEXT,
          "lastVisaExamResults" TEXT,
          "screeningStep" TEXT DEFAULT 'before-acetic',
          doctor_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    });
    
    if (patientsResult.error) {
      console.error('Error creating patients table:', patientsResult.error);
      // Continue anyway, we'll try another approach
    } else {
      console.log('Patients table created or already exists');
    }
    
    // Create screening_results table
    const resultsResult = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS screening_results (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id UUID NOT NULL,
          doctor_id UUID NOT NULL,
          "analysisResult" TEXT NOT NULL CHECK ("analysisResult" IN ('positive', 'negative')),
          "analysisDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "beforeAceticImage" TEXT,
          "afterAceticImage" TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    });
    
    if (resultsResult.error) {
      console.error('Error creating screening_results table:', resultsResult.error);
      // Continue anyway, we'll try another approach
    } else {
      console.log('Screening results table created or already exists');
    }
    
    // Create storage bucket
    try {
      await supabase.storage.createBucket('cervical_images', {
        public: true
      });
      console.log('Storage bucket created or already exists');
    } catch (error) {
      if (error.status !== 409) { // 409 means it already exists
        console.warn('Warning creating storage bucket:', error);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in schema setup:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during schema setup'
    };
  }
};

// Helper function to check if Supabase is properly configured
export const testSupabaseConnection = async () => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    // Try a simple query to test the connection
    const { data, error: queryError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    if (queryError) {
      // If the error code is 42P01, this means the table doesn't exist but connection works
      if (queryError.code === '42P01') {
        return { 
          success: true, 
          message: 'Connection successful but tables need to be created',
          needsSetup: true 
        };
      }
      
      return { 
        success: false, 
        error: queryError.message || 'Unknown database error',
        code: queryError.code
      };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export { supabase };
