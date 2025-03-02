
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

// Execute the SQL setup directly
export const executeSchemaSetup = async () => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    // Execute the schema SQL
    const { error } = await supabase.rpc('execute_schema_setup');
    
    if (error) {
      console.error('Error executing schema setup:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Schema setup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during schema setup'
    };
  }
};

export { supabase };
