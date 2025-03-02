
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

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
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check for active session on initial load
  useEffect(() => {
    setIsLoading(true);
    
    // Get session from Supabase
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentDoctor({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || `Dr. ${user.email?.split('@')[0] || 'User'}`
          });
        }
      }
      
      setIsLoading(false);
    };
    
    fetchSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentDoctor({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || `Dr. ${session.user.email?.split('@')[0] || 'User'}`
          });
        } else if (event === 'SIGNED_OUT') {
          setCurrentDoctor(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real login function with Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Login successful",
          description: `Welcome back, Dr. ${data.user.email?.split('@')[0] || 'User'}`,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error:', authError);
      
      toast({
        title: "Login failed",
        description: authError.message || "An error occurred during login",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // New signup function with Supabase
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || `Dr. ${email.split('@')[0]}`,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Signup error:', authError);
      
      toast({
        title: "Signup failed",
        description: authError.message || "An error occurred during signup",
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
      setCurrentDoctor(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentDoctor,
        isAuthenticated: !!currentDoctor,
        isLoading,
        login,
        signup,
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
