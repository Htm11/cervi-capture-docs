
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, Calendar, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface PatientResult {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  analysisResult: 'positive' | 'negative';
  analysisDate: string;
}

const Results = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<PatientResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load results from local storage
    const storedResults = localStorage.getItem('resultsHistory');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
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
    navigate('/feedback');
  };
  
  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Patient Results</h1>
        
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
