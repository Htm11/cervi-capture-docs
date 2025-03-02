
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Doctor, AuthContextType } from '@/types/auth';
import { loginUser, registerUser, logoutUser, checkSession } from '@/services/authService';
import { initializeDatabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check for saved user on initial load
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const userData = await checkSession();
        
        if (userData) {
          setCurrentDoctor(userData);
          localStorage.setItem('cerviDoctor', JSON.stringify(userData));
          
          // Initialize database when user is authenticated
          await initializeDatabase();
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSession();
  }, []);

  // Login with Supabase or mock in dev mode
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
      const { success, doctor, error } = await loginUser(email, password);
      
      if (!success || !doctor) {
        toast({
          title: "Login failed",
          description: error || "Authentication failed",
          variant: "destructive",
        });
        return false;
      }
      
      setCurrentDoctor(doctor);
      localStorage.setItem('cerviDoctor', JSON.stringify(doctor));
      
      // Initialize database after successful login
      await initializeDatabase();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${doctor.name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Login handler error:', error);
      
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Supabase or mock in dev mode
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
      const { success, doctor, error } = await registerUser(email, password, name);
      
      if (!success) {
        toast({
          title: "Registration failed",
          description: error || "Registration failed",
          variant: "destructive",
        });
        
        if (error === 'Email verification required') {
          toast({
            title: "Email verification required",
            description: "Please check your email to confirm your account",
          });
        }
        
        return false;
      }
      
      if (doctor) {
        setCurrentDoctor(doctor);
        localStorage.setItem('cerviDoctor', JSON.stringify(doctor));
        
        // Initialize database after successful registration
        await initializeDatabase();
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${doctor.name}`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration handler error:', error);
      
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setCurrentDoctor(null);
      localStorage.removeItem('cerviDoctor');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout handler error:', error);
      
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
