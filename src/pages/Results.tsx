
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, Calendar, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface PatientResult {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  analysisResult: 'positive' | 'negative';
  analysisDate: string;
  beforeAceticImage?: string;
  afterAceticImage?: string;
}

// Helper functions to manage results history in localStorage
export const getResultsHistory = (): PatientResult[] => {
  const storedResults = localStorage.getItem('resultsHistory');
  if (!storedResults) return [];
  
  try {
    const parsedResults = JSON.parse(storedResults);
    return Array.isArray(parsedResults) ? parsedResults : [];
  } catch (error) {
    console.error("Error parsing results history:", error);
    return [];
  }
};

export const saveResultToHistory = (result: PatientResult): void => {
  // Get existing results
  const existingResults = getResultsHistory();
  
  // Generate a unique ID if not present
  const resultWithId = {
    ...result,
    id: result.id || `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  // Check if this result already exists (by ID)
  const resultExists = existingResults.some(r => r.id === resultWithId.id);
  
  // Save the updated results
  const updatedResults = resultExists
    ? existingResults.map(r => r.id === resultWithId.id ? resultWithId : r)
    : [...existingResults, resultWithId];
  
  localStorage.setItem('resultsHistory', JSON.stringify(updatedResults));
  
  // Also save as current patient
  localStorage.setItem('currentPatient', JSON.stringify(resultWithId));
};

const Results = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<PatientResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load all historical results from local storage
    const resultsHistory = getResultsHistory();
    console.log('Loaded results history:', resultsHistory);
    
    // Sort by date (newest first)
    resultsHistory.sort((a: PatientResult, b: PatientResult) => 
      new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    );
    
    setResults(resultsHistory);
    
    // For demonstration, let's add test results if none exist
    if (resultsHistory.length === 0) {
      console.log('No results found, you may want to add some test data for demonstration');
    }
  }, [isAuthenticated, navigate]);
  
  // Filter results based on search term
  const filteredResults = results.filter(result => 
    `${result.firstName} ${result.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.phoneNumber.includes(searchTerm)
  );
  
  const handleResultClick = (result: PatientResult) => {
    // Set as current patient and navigate to feedback
    localStorage.setItem('currentPatient', JSON.stringify(result));
    
    // We need to set the images too if available
    // This is a simplification - in a real app you would store image references in the database
    localStorage.setItem('beforeAceticImage', result.beforeAceticImage || '');
    localStorage.setItem('afterAceticImage', result.afterAceticImage || '');
    
    navigate('/feedback');
  };
  
  // For testing: Add a sample result
  const addSampleResult = () => {
    const sampleResult: PatientResult = {
      id: `test_${Date.now()}`,
      firstName: "Test",
      lastName: `Patient ${Math.floor(Math.random() * 100)}`,
      phoneNumber: `+1${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
      dateOfBirth: "1990-01-01",
      analysisResult: Math.random() > 0.5 ? 'positive' : 'negative',
      analysisDate: new Date().toISOString(),
    };
    
    saveResultToHistory(sampleResult);
    
    // Reload results
    setResults(getResultsHistory().sort((a, b) => 
      new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    ));
    
    toast({
      title: "Added sample result",
      description: "A sample patient result was added for testing",
    });
  };
  
  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Patient Results History</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={addSampleResult}
          >
            Add Sample (Test)
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
        
        {filteredResults.length === 0 ? (
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
                    <h3 className="font-medium">{result.firstName} {result.lastName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{result.phoneNumber}</span>
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
