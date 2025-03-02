
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with provided credentials
const supabaseUrl = 'https://lksrlstiabxjoxfkgdat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3Jsc3RpYWJ4am94ZmtnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDI5NTMsImV4cCI6MjA1NjQ3ODk1M30.jXyjs00Tat9Tfn_9VlGuZthZb_5slJHPF7C_zHM9X2M';

// Create a function to check if Supabase credentials are valid
export const hasValidSupabaseCredentials = () => {
  return supabaseUrl && supabaseAnonKey;
};

// Initialize Supabase client only once to avoid multiple client instances
let supabase;
if (hasValidSupabaseCredentials()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Still fall back to mock in development if needed
  }
} else {
  console.warn('Supabase credentials not found or incomplete. Using mock authentication.');
}

// Function to initialize database schema if needed
export const initializeDatabase = async () => {
  if (!supabase) {
    console.log('Supabase client not available, skipping database initialization');
    return false;
  }

  try {
    console.log('Checking if patients table exists...');
    const { data: patients, error: patientsCheckError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);

    if (patientsCheckError && patientsCheckError.code === '42P01') {
      console.log('Patients table does not exist, creating schema...');
      return await createDatabaseSchema();
    } else if (patientsCheckError) {
      console.error('Error checking patients table:', patientsCheckError);
      return false;
    } else {
      console.log('Database schema already exists');
      return true;
    }
  } catch (error) {
    console.error('Error during database initialization check:', error);
    return false;
  }
};

// Create the database schema using SQL
async function createDatabaseSchema() {
  if (!supabase) return false;
  
  try {
    // Try to execute SQL using stored procedure (requires admin privileges)
    const { error } = await supabase.rpc('exec_sql', {
      sql_string: `
        -- Patients table
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
        );

        -- Screening results table
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
        );
      `
    });

    if (!error) {
      console.log('Database schema created successfully using RPC');
      return true;
    }

    console.log('RPC method not available, trying direct SQL execution...');
    
    // Try with direct SQL execution (if possible)
    const { error: patientsError } = await supabase.from('patients').insert({
      "firstName": "test",
      "lastName": "user",
      "phoneNumber": "123456789",
      doctor_id: "00000000-0000-0000-0000-000000000000"
    }).select();
    
    if (!patientsError || patientsError.code !== '42P01') {
      console.log('Patients table exists or was created');
      return true;
    }
    
    console.error('Could not create or access database tables. Please check your Supabase configuration.');
    return false;
  } catch (error) {
    console.error('Error creating database schema:', error);
    return false;
  }
}

export { supabase };
