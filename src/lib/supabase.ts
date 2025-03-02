
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lksrlstiabxjoxfkgdat.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3Jsc3RpYWJ4am94ZmtnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDI5NTMsImV4cCI6MjA1NjQ3ODk1M30.jXyjs00Tat9Tfn_9VlGuZthZb_5slJHPF7C_zHM9X2M';

// Create a function to check if Supabase credentials are valid
export const hasValidSupabaseCredentials = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.includes('supabase.co');
};

// Initialize Supabase client
let supabase;

try {
  if (hasValidSupabaseCredentials()) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } else {
    console.warn('Valid Supabase credentials not found. Some features may be unavailable.');
    
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      console.log('Using mock authentication in development mode');
    } else {
      console.warn('Set VITE_USE_MOCK_AUTH=true in .env to enable mock authentication in development');
    }
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export { supabase };
