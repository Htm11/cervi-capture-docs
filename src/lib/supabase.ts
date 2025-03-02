
import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise use empty strings for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only throw an error in production environment
if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
