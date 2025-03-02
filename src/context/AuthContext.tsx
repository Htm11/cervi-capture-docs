
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check for saved user on initial load
  useEffect(() => {
    const savedDoctor = localStorage.getItem('cerviDoctor');
    if (savedDoctor) {
      try {
        setCurrentDoctor(JSON.parse(savedDoctor));
      } catch (error) {
        console.error('Failed to parse saved doctor', error);
        localStorage.removeItem('cerviDoctor');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock login function - modified to always succeed for testing
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay (reduced for testing)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // For testing, always succeed regardless of input
      // Use provided email or a default
      const userEmail = email || 'test@example.com';
      
      // Mocked doctor data - would come from your API
      const mockDoctor: Doctor = {
        id: '123456',
        name: 'Dr. ' + userEmail.split('@')[0],
        email: userEmail
      };
      
      setCurrentDoctor(mockDoctor);
      localStorage.setItem('cerviDoctor', JSON.stringify(mockDoctor));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${mockDoctor.name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
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

  const logout = () => {
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
