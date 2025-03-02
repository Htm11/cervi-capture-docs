import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { toast } from "@/components/ui/use-toast";
import { supabase, hasValidSupabaseCredentials, checkSupabaseEnv, testSupabaseConnection } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  currentDoctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectionError: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    // Check and log Supabase environment status
    const envStatus = checkSupabaseEnv();
    console.log('Authentication mode:', envStatus ? 'Real Supabase auth' : 'Mock authentication');
    
    const initAuth = async () => {
      setIsLoading(true);
      
      // Test Supabase connection first
      if (envStatus) {
        const connectionSuccessful = await testSupabaseConnection();
        if (!connectionSuccessful) {
          console.log('⚠️ Supabase connection failed. Falling back to mock authentication.');
          setConnectionError(true);
          setIsLoading(false);
          return;
        }
      }
      
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setConnectionError(true);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          setSession(session);
          
          // Convert the session user to a doctor object
          if (session.user) {
            const { id, email } = session.user;
            
            // Try to get user metadata (name) from Supabase profile
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', id)
                .single();
              
              const name = profileData?.name || email?.split('@')[0] || 'Doctor';
              
              setCurrentDoctor({
                id,
                name,
                email: email || '',
              });
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
              // Still set basic doctor info even if profile fetch fails
              setCurrentDoctor({
                id,
                name: email?.split('@')[0] || 'Doctor',
                email: email || '',
              });
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          const { id, email } = session.user;
          
          // Try to get user metadata from Supabase profile
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', id)
              .single();
            
            const name = profileData?.name || email?.split('@')[0] || 'Doctor';
            
            setCurrentDoctor({
              id,
              name,
              email: email || '',
            });
          } catch (profileError) {
            console.error('Error fetching profile on auth change:', profileError);
            // Still set basic doctor info even if profile fetch fails
            setCurrentDoctor({
              id,
              name: email?.split('@')[0] || 'Doctor',
              email: email || '',
            });
          }
        } else {
          setCurrentDoctor(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if we're using mock auth in development or if there was a connection error
      if (!hasValidSupabaseCredentials() || connectionError) {
        // Mock successful login for development
        const mockUser = {
          id: 'mock-user-id',
          name: email.split('@')[0] || 'Doctor',
          email: email
        };
        setCurrentDoctor(mockUser);
        
        toast({
          title: "Development mode",
          description: `Logged in as ${mockUser.name} (mock authentication)`,
        });
        
        return true;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        
        // Provide better error messages based on error type
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
          errorMessage = "Network error: Please check your internet connection and try again.";
          setConnectionError(true);
          
          // If network error, fall back to mock authentication
          const mockUser = {
            id: 'mock-user-id',
            name: email.split('@')[0] || 'Doctor',
            email: email
          };
          setCurrentDoctor(mockUser);
          
          toast({
            title: "Connection issues detected",
            description: `Logged in as ${mockUser.name} (mock authentication)`,
          });
          
          return true;
        }
        
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.email?.split('@')[0] || 'Doctor'}`,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fall back to mock auth if there's an unexpected error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Load failed')) {
        const mockUser = {
          id: 'mock-user-id',
          name: email.split('@')[0] || 'Doctor',
          email: email
        };
        setCurrentDoctor(mockUser);
        setConnectionError(true);
        
        toast({
          title: "Connection issues detected",
          description: `Logged in as ${mockUser.name} (mock authentication)`,
        });
        
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Using mock authentication.",
        variant: "destructive",
      });
      
      // Use mock auth as fallback
      const mockUser = {
        id: 'mock-user-id',
        name: email.split('@')[0] || 'Doctor',
        email: email
      };
      setCurrentDoctor(mockUser);
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if we're using mock auth in development
      if (!hasValidSupabaseCredentials()) {
        // Mock successful signup for development
        toast({
          title: "Development mode",
          description: "Account created successfully (mock authentication)",
        });
        return true;
      }
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        // Create a profile entry for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              name,
              email,
              created_at: new Date().toISOString(),
            }
          ]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        toast({
          title: "Signup successful",
          description: "Your account has been created. You can now log in.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (hasValidSupabaseCredentials()) {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Always clear local state
    setCurrentDoctor(null);
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
        connectionError,
        login,
        logout,
        signUp
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
