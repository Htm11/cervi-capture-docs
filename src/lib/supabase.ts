
import { createClient } from '@supabase/supabase-js';

// Default Supabase URL if environment variable is not set
const DEFAULT_SUPABASE_URL = 'https://lksrlstiabjoxfkgdat.supabase.co';

// Default Supabase anon key from the user's provided token
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3Jsc3RpYWJ4am94ZmtnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDI5NTMsImV4cCI6MjA1NjQ3ODk1M30.jXyjs00Tat9Tfn_9VlGuZthZb_5slJHPF7C_zHM9X2M';

// Get environment variables or use default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This helper function checks if we have actual Supabase credentials
export const hasValidSupabaseCredentials = () => {
  return !!supabaseUrl && !!supabaseAnonKey && 
    supabaseUrl !== 'https://example.supabase.co' && 
    supabaseAnonKey !== 'example-anon-key';
};

// Helper function to check and log environment variables status
export const checkSupabaseEnv = () => {
  if (!hasValidSupabaseCredentials()) {
    console.log('⚠️ Supabase credentials are not set up correctly');
    console.log('To set up Supabase, add the following to your project environment variables:');
    console.log('VITE_SUPABASE_URL - Your Supabase project URL');
    console.log('VITE_SUPABASE_ANON_KEY - Your Supabase anon/public key');
    console.log('You can find these in your Supabase dashboard under Project Settings > API');
    return false;
  }
  console.log('✅ Supabase environment variables are set up correctly!');
  return true;
};
