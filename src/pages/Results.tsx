
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, Calendar, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { getResultsByDoctor, migrateLocalStorageToSupabase } from '@/services/patientService';
import { ScreeningResult } from '@/types/patient';

interface PatientResult extends ScreeningResult {
  patients?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth?: string;
  };
}

const Results = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<PatientResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated || !currentDoctor) {
      navigate('/login');
      return;
    }
    
    const loadResults = async () => {
      setIsLoading(true);
      
      try {
        // Try to migrate any localStorage data first
        await migrateLocalStorageToSupabase(currentDoctor.id);
        
        // Then load results from Supabase
        const { data, error } = await getResultsByDoctor(currentDoctor.id);
        
        if (error) {
          console.error('Error loading results:', error);
          toast({
            title: "Failed to load results",
            description: "There was an error loading your results",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          setResults(data as PatientResult[]);
        }
      } catch (error) {
        console.error('Error in loadResults:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResults();
  }, [isAuthenticated, currentDoctor, navigate, toast]);
  
  // Filter results based on search term
  const filteredResults = results.filter(result => {
    if (!result.patients) return false;
    
    return `${result.patients.firstName} ${result.patients.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patients.phoneNumber.includes(searchTerm);
  });
  
  const handleResultClick = (result: PatientResult) => {
    if (!result.patients) return;
    
    // Store selected patient/result details for the feedback page
    localStorage.setItem('currentPatient', JSON.stringify({
      id: result.patient_id,
      firstName: result.patients.firstName,
      lastName: result.patients.lastName,
      phoneNumber: result.patients.phoneNumber,
      dateOfBirth: result.patients.dateOfBirth,
      analysisResult: result.analysisResult,
      analysisDate: result.analysisDate,
      screeningStep: 'completed'
    }));
    
    // Store image URLs
    if (result.beforeAceticImage) {
      localStorage.setItem('beforeAceticImage', result.beforeAceticImage);
    }
    
    if (result.afterAceticImage) {
      localStorage.setItem('afterAceticImage', result.afterAceticImage);
    }
    
    navigate('/feedback');
  };
  
  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Patient Results History</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/patient-registration')}
          >
            New Patient
          </Button>
        </div>
        
        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or phone number"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cervi-600"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <p className="text-muted-foreground">No patient results found</p>
            <Button 
              className="mt-4 bg-cervi-500 hover:bg-cervi-600 text-white"
              onClick={() => navigate('/patient-registration')}
            >
              Register New Patient
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result, index) => (
              <div 
                key={result.id || index}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {result.patients?.firstName} {result.patients?.lastName}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{result.patients?.phoneNumber}</span>
                    </div>
                  </div>
                  
                  {result.analysisResult === 'positive' ? (
                    <div className="flex items-center text-red-500 bg-red-50 py-1 px-2 rounded">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Positive</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-500 bg-green-50 py-1 px-2 rounded">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Negative</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {result.analysisDate 
                      ? format(new Date(result.analysisDate), 'MMM d, yyyy') 
                      : 'Date not available'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Results;
