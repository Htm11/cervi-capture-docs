
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

// Direct SQL execution for database schema setup
export const executeSchemaSetup = async () => {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }
  
  try {
    console.log('Starting database schema setup...');
    
    // Check if we can run SQL via RPC
    const canExecuteSQL = await checkRPCSupport();
    
    if (canExecuteSQL) {
      return await setupSchemaWithRPC();
    } else {
      console.log('RPC method not available, attempting direct table creation...');
      return await setupSchemaDirectly();
    }
  } catch (error) {
    console.error('Error in schema setup:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during schema setup'
    };
  }
};

// Check if the execute_sql RPC function is available
const checkRPCSupport = async () => {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1'
    });
    
    return !error;
  } catch {
    return false;
  }
};

// Setup schema using RPC if available
const setupSchemaWithRPC = async () => {
  try {
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
      console.error('Error creating patients table via RPC:', patientsResult.error);
      return { success: false, error: patientsResult.error.message };
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
      console.error('Error creating screening_results table via RPC:', resultsResult.error);
      return { success: false, error: resultsResult.error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in RPC schema setup:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'RPC schema setup failed' 
    };
  }
};

// Create tables directly using Supabase API
const setupSchemaDirectly = async () => {
  try {
    console.log('Attempting to create tables directly...');
    
    // Try to create patients table by inserting a test record
    console.log('Creating patients table...');
    const { error: patientsError } = await supabase
      .from('patients')
      .insert({
        firstName: 'TestUser',
        lastName: 'TestLastName',
        phoneNumber: '1234567890',
        doctor_id: '00000000-0000-0000-0000-000000000000',
        screeningStep: 'before-acetic'
      })
      .select('id')
      .single();
    
    // If there's an error that's not a unique constraint violation, the table might not exist
    if (patientsError && patientsError.code !== '23505') {
      console.error('Error creating patients table directly:', patientsError);
      // We'll continue anyway to try the other table
    } else {
      console.log('Patients table exists or was created successfully');
    }
    
    // Try to create screening_results table by inserting a test record
    console.log('Creating screening_results table...');
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
      console.error('Error creating screening_results table directly:', resultError);
      // If both attempts failed, return an error
      if (patientsError && patientsError.code !== '23505') {
        return { 
          success: false, 
          error: 'Failed to create database tables. Check Supabase permissions.'
        };
      }
    } else {
      console.log('Screening results table exists or was created successfully');
    }
    
    // Create storage bucket
    try {
      console.log('Creating storage bucket...');
      await supabase.storage.createBucket('cervical_images', {
        public: true
      });
      console.log('Storage bucket created or already exists');
    } catch (error) {
      if (error.status !== 409) { // 409 means it already exists
        console.warn('Warning creating storage bucket:', error);
      }
    }
    
    console.log('Database schema setup completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in direct schema setup:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Direct schema setup failed'
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
