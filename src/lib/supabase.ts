
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
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not found or incomplete. Using mock authentication.');
}

export { supabase };
