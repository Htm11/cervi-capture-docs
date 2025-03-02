
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Doctor, AuthContextType } from '@/types/auth';
import { loginUser, registerUser, logoutUser, checkSession } from '@/services/authService';
import { initializeDatabaseSchema, migrateLocalStorageToSupabase } from '@/services/patientService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbInitializing, setIsDbInitializing] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for saved user on initial load
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const userData = await checkSession();
        
        if (userData) {
          setCurrentDoctor(userData);
          localStorage.setItem('cerviDoctor', JSON.stringify(userData));
          
          // Try to initialize database schema
          await setupDatabase();
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSession();
  }, []);
  
  // Setup database schema
  const setupDatabase = async () => {
    setIsDbInitializing(true);
    try {
      const { success, error } = await initializeDatabaseSchema();
      
      if (!success) {
        console.error('Database initialization failed:', error);
        toast({
          title: "Database setup issue",
          description: error || "There was a problem setting up the database. Some features may not work correctly.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Database setup error:', error);
    } finally {
      setIsDbInitializing(false);
    }
  };

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
      
      // Set up database schema
      await setupDatabase();
      
      // Attempt to migrate any local data to Supabase
      if (doctor.id) {
        try {
          const migrationSuccess = await migrateLocalStorageToSupabase(doctor.id);
          if (migrationSuccess) {
            console.log('Successfully migrated local data to Supabase');
          } else {
            console.warn('There may have been issues migrating local data');
          }
        } catch (migrationError) {
          console.error('Error during data migration:', migrationError);
        }
      }
      
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
        
        // Set up database schema
        await setupDatabase();
        
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
        isLoading: isLoading || isDbInitializing,
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
