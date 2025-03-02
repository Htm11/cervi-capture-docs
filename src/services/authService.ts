
import { supabase, hasValidSupabaseCredentials } from '@/lib/supabase';
import { Doctor } from '@/types/auth';

// Check if we're in development and should use mock authentication
const USE_MOCK_AUTH = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// Login service function
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; doctor?: Doctor; error?: string }> => {
  try {
    // If mock auth is explicitly enabled, use it
    if (USE_MOCK_AUTH) {
      console.log('Using mock login as requested in development environment');
      const mockDoctor: Doctor = {
        id: '123456',
        name: 'Dr. ' + email.split('@')[0],
        email: email
      };
      
      return {
        success: true,
        doctor: mockDoctor
      };
    }

    // Try to login with Supabase if credentials are available
    if (hasValidSupabaseCredentials() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase login error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Success - get user data from doctors table
      if (data.user) {
        try {
          // Fetch the doctor data from the doctors table
          const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (doctorError) {
            console.error('Error fetching doctor profile:', doctorError);
          }
          
          const userData: Doctor = {
            id: data.user.id,
            email: data.user.email || email,
            name: doctorData?.name || data.user.user_metadata?.name || `Dr. ${email.split('@')[0]}`
          };
          
          return {
            success: true,
            doctor: userData
          };
        } catch (profileError) {
          console.error('Error getting doctor profile:', profileError);
          
          // Fallback to basic user data if profile fetch fails
          const userData: Doctor = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || `Dr. ${email.split('@')[0]}`
          };
          
          return {
            success: true,
            doctor: userData
          };
        }
      }
      
      return {
        success: false,
        error: 'No user data returned'
      };
    } else {
      // No valid Supabase connection and mock auth is not enabled
      return {
        success: false,
        error: 'Authentication service unavailable'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An error occurred during login'
    };
  }
};

// Register service function
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; doctor?: Doctor; error?: string }> => {
  try {
    // If mock auth is explicitly enabled, use it
    if (USE_MOCK_AUTH) {
      console.log('Using mock registration as requested in development environment');
      const mockDoctor: Doctor = {
        id: '123456',
        name: name || 'Dr. ' + email.split('@')[0],
        email: email
      };
      
      return {
        success: true,
        doctor: mockDoctor
      };
    }

    // Try to register with Supabase if credentials are available
    if (hasValidSupabaseCredentials() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || `Dr. ${email.split('@')[0]}`
          }
        }
      });

      if (error) {
        console.error('Supabase registration error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'Email verification required'
        };
      }

      // Success - doctor profile will be created automatically via database trigger
      if (data.user) {
        // Create doctor object from the user data
        const userData: Doctor = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || `Dr. ${email.split('@')[0]}`
        };
        
        // If auto-confirmation is enabled in Supabase, the user will be logged in
        if (data.session) {
          return {
            success: true,
            doctor: userData
          };
        } else {
          return {
            success: false,
            error: 'Please check your email to confirm your account'
          };
        }
      }
      
      return {
        success: false,
        error: 'No user data returned'
      };
    } else {
      // No valid Supabase connection and mock auth is not enabled
      return {
        success: false,
        error: 'Authentication service unavailable'
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'An error occurred during registration'
    };
  }
};

// Logout service function
export const logoutUser = async (): Promise<void> => {
  try {
    if (hasValidSupabaseCredentials() && supabase) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Session check service function
export const checkSession = async (): Promise<Doctor | null> => {
  try {
    // If mock auth is explicitly enabled and we have a saved session, use it
    if (USE_MOCK_AUTH) {
      const savedDoctor = localStorage.getItem('cerviDoctor');
      if (savedDoctor) {
        try {
          return JSON.parse(savedDoctor);
        } catch (error) {
          console.error('Failed to parse saved doctor', error);
          localStorage.removeItem('cerviDoctor');
        }
      }
      return null;
    }
    
    // Try to get the session from Supabase if credentials are available
    if (hasValidSupabaseCredentials() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { user } = session;
        
        try {
          // Fetch the doctor data from the doctors table
          const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (doctorError) {
            console.error('Error fetching doctor profile:', doctorError);
          }
          
          if (doctorData) {
            // Return doctor data from the database
            return {
              id: user.id,
              email: doctorData.email || user.email || '',
              name: doctorData.name || user.user_metadata?.name || `Dr. ${user.email?.split('@')[0] || 'Doctor'}`
            };
          }
        } catch (profileError) {
          console.error('Error getting doctor profile:', profileError);
        }
        
        // Fallback to basic user metadata if profile fetch fails
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || `Dr. ${user.email?.split('@')[0] || 'Doctor'}`
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking session:', error);
    return null;
  }
};
