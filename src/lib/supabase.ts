
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid credentials and warn if we don't
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Using mock authentication for development.');
}

// Create and export the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'example-anon-key'
);

// This helper function checks if we have actual Supabase credentials
export const hasValidSupabaseCredentials = () => {
  return !!supabaseUrl && !!supabaseAnonKey && 
    supabaseUrl !== 'https://example.supabase.co' && 
    supabaseAnonKey !== 'example-anon-key';
};

// Helper function to check and log environment variables status
export const checkSupabaseEnv = () => {
  if (!hasValidSupabaseCredentials()) {
    console.log('⚠️ Supabase environment variables are not set up correctly');
    console.log('To set up Supabase, add the following to your project environment variables:');
    console.log('VITE_SUPABASE_URL - Your Supabase project URL');
    console.log('VITE_SUPABASE_ANON_KEY - Your Supabase anon/public key');
    console.log('You can find these in your Supabase dashboard under Project Settings > API');
    return false;
  }
  console.log('✅ Supabase environment variables are set up correctly!');
  return true;
};
