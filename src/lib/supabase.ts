
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use the provided key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lksrlstiabjoxfkgdat.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3Jsc3RpYWJ4am94ZmtnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDI5NTMsImV4cCI6MjA1NjQ3ODk1M30.jXyjs00Tat9Tfn_9VlGuZthZb_5slJHPF7C_zHM9X2M';

// Create and export the Supabase client with more resilient options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => fetch(...args)
  }
});

// This helper function checks if we have actual Supabase credentials
export const hasValidSupabaseCredentials = () => {
  return !!supabaseUrl && !!supabaseAnonKey && 
    supabaseAnonKey !== 'example-anon-key';
};

// Helper function to check and log environment variables status
export const checkSupabaseEnv = () => {
  const isValid = hasValidSupabaseCredentials();
  if (!isValid) {
    console.log('⚠️ Supabase credentials are not set up correctly');
    console.log('Using fallback authentication mode');
    return false;
  }
  console.log('✅ Supabase environment variables are set up correctly!');
  return true;
};

// Helper function to test the Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // A simple query to test the connection
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection test successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};
