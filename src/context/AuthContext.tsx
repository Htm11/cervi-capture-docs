
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  currentDoctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check for saved user on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get the session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user } = session;
          // Get user metadata if available
          const userData = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || `Dr. ${user.email?.split('@')[0]}` || 'Doctor'
          };
          
          setCurrentDoctor(userData);
          localStorage.setItem('cerviDoctor', JSON.stringify(userData));
        } else {
          // Try fallback to local storage if no active session
          const savedDoctor = localStorage.getItem('cerviDoctor');
          if (savedDoctor) {
            try {
              setCurrentDoctor(JSON.parse(savedDoctor));
            } catch (error) {
              console.error('Failed to parse saved doctor', error);
              localStorage.removeItem('cerviDoctor');
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        
        // Fallback to localStorage
        const savedDoctor = localStorage.getItem('cerviDoctor');
        if (savedDoctor) {
          try {
            setCurrentDoctor(JSON.parse(savedDoctor));
          } catch (error) {
            console.error('Failed to parse saved doctor', error);
            localStorage.removeItem('cerviDoctor');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Login with Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      toast({
        title: "Login failed",
        description: "Email and password are required",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Try to login with Supabase
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
          
          setCurrentDoctor(mockDoctor);
          localStorage.setItem('cerviDoctor', JSON.stringify(mockDoctor));
          
          toast({
            title: "DEV MODE: Mock login successful",
            description: `Welcome back, ${mockDoctor.name}`,
          });
          
          return true;
        }
        
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Success - save the user data
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || `Dr. ${email.split('@')[0]}`
        };
        
        setCurrentDoctor(userData);
        localStorage.setItem('cerviDoctor', JSON.stringify(userData));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}`,
        });
        
        return true;
      }
      
      return false;
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
        
        setCurrentDoctor(mockDoctor);
        localStorage.setItem('cerviDoctor', JSON.stringify(mockDoctor));
        
        toast({
          title: "DEV MODE: Mock login successful",
          description: `Welcome back, ${mockDoctor.name}`,
        });
        
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Supabase
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (!email || !password) {
      toast({
        title: "Registration failed",
        description: "Email and password are required",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Try to register with Supabase
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
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Email verification required",
          description: "Please check your email to confirm your account",
        });
        return false;
      }

      // Success - save the user data
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || `Dr. ${email.split('@')[0]}`
        };
        
        // If auto-confirmation is enabled in Supabase, the user will be logged in
        if (data.session) {
          setCurrentDoctor(userData);
          localStorage.setItem('cerviDoctor', JSON.stringify(userData));
          
          toast({
            title: "Registration successful",
            description: `Welcome, ${userData.name}`,
          });
          
          return true;
        } else {
          toast({
            title: "Registration successful",
            description: "Please check your email to confirm your account",
          });
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentDoctor(null);
    localStorage.removeItem('cerviDoctor');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentDoctor,
        isAuthenticated: !!currentDoctor,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
