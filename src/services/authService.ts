
import { supabase, hasValidSupabaseCredentials } from '@/lib/supabase';
import { Doctor } from '@/types/auth';

// Login service function
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; doctor?: Doctor; error?: string }> => {
  try {
    // Try to login with Supabase if credentials are available
    if (hasValidSupabaseCredentials() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase login error:', error);
        
        // If we're in development mode, allow mock login for testing
        if (import.meta.env.DEV) {
          console.log('Using mock login for development');
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
        
        return {
          success: false,
          error: error.message
        };
      }

      // Success - return the user data
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || `Dr. ${email.split('@')[0]}`
        };
        
        return {
          success: true,
          doctor: userData
        };
      }
      
      return {
        success: false,
        error: 'No user data returned'
      };
    } else {
      // Fallback for when Supabase is not available
      console.log('Supabase not available, using mock login');
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
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback for development
    if (import.meta.env.DEV) {
      console.log('Using mock login for development due to error');
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
    
    return {
      success: false,
      error: 'An error occurred during login'
    };
  }
};

// Register service function
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; doctor?: Doctor; error?: string }> => {
  try {
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

      // Success - return the user data
      if (data.user) {
        const userData = {
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
      // Fallback for when Supabase is not available
      console.log('Supabase not available, using mock registration');
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
  } catch (error) {
    console.error('Registration error:', error);
    
    // Fallback for development
    if (import.meta.env.DEV) {
      console.log('Using mock registration for development due to error');
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
    // Try to get the session from Supabase if credentials are available
    if (hasValidSupabaseCredentials() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { user } = session;
        // Get user metadata if available
        const userData = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || `Dr. ${user.email?.split('@')[0]}` || 'Doctor'
        };
        
        return userData;
      }
    }
    
    // Try fallback to local storage if no active session or Supabase not available
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
  } catch (error) {
    console.error('Error checking session:', error);
    
    // Fallback to localStorage
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
};
