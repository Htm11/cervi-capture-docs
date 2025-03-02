
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, Calendar, Phone, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { ScreeningResult, getDoctorScreeningResults, deleteScreeningResult } from '@/services/screeningService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Results = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        if (currentDoctor?.id) {
          // Fetch results from the database
          const doctorResults = await getDoctorScreeningResults(currentDoctor.id);
          console.log('Loaded results from database:', doctorResults);
          setResults(doctorResults);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error loading results",
          description: "There was a problem loading your screening results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [isAuthenticated, navigate, currentDoctor, toast]);
  
  const filteredResults = results.filter(result => {
    if (!result.patients) {
      // If there's no patient data, include in results but can't search
      return !searchTerm;
    }
    
    const patientName = `${result.patients.first_name} ${result.patients.last_name}`.toLowerCase();
    const patientPhone = result.patients.contact_number || '';
    
    return patientName.includes(searchTerm.toLowerCase()) || 
           patientPhone.includes(searchTerm);
  });
  
  const handleResultClick = (result: ScreeningResult) => {
    // Make sure we handle cases where patient data might be missing
    const patient = {
      id: result.patient_id,
      firstName: result.patients?.first_name || '',
      lastName: result.patients?.last_name || '',
      phoneNumber: result.patients?.contact_number || '',
      dateOfBirth: result.patients?.date_of_birth || '',
      analysisResult: result.result,
      analysisDate: result.created_at || '',
      beforeAceticImage: result.before_image_url || '',
      afterAceticImage: result.after_image_url || '',
    };
    
    // Set as current patient and navigate to feedback
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    
    // Set the images
    localStorage.setItem('beforeAceticImage', patient.beforeAceticImage || '');
    localStorage.setItem('afterAceticImage', patient.afterAceticImage || '');
    
    navigate('/feedback');
  };
  
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setDeleteId(id);
  };
  
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const success = await deleteScreeningResult(deleteId);
      
      if (success) {
        // Remove the deleted result from the state
        setResults(prevResults => prevResults.filter(r => r.id !== deleteId));
        
        toast({
          title: "Result deleted",
          description: "The screening result has been deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Could not delete the screening result.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the result.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };
  
  const cancelDelete = () => {
    setDeleteId(null);
  };
  
  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Patient Results History</h1>
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
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-cervi-500 rounded-full border-t-transparent"></div>
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
            {filteredResults.map((result) => (
              <div 
                key={result.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {result.patients ? 
                        `${result.patients.first_name} ${result.patients.last_name}` : 
                        `Patient ID: ${result.patient_id.substring(0, 8)}...`}
                    </h3>
                    {result.patients && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{result.patients.contact_number || 'No phone number'}</span>
                      </div>
                    )}
                  </div>
                  
                  {result.result === 'positive' ? (
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
                    {result.created_at 
                      ? format(new Date(result.created_at), 'MMM d, yyyy') 
                      : 'Date not available'}
                  </span>
                </div>
                
                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-transparent"
                  onClick={(e) => handleDeleteClick(e, result.id || '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => !deleteId && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              screening result from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Results;

export const saveResultToHistory = (patientData: any) => {
  try {
    // Save to local storage history
    const existingHistoryStr = localStorage.getItem('resultsHistory');
    const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
    
    // Add the new result
    const updatedHistory = [patientData, ...existingHistory];
    
    // Save back to local storage
    localStorage.setItem('resultsHistory', JSON.stringify(updatedHistory));
    
    return true;
  } catch (error) {
    console.error('Error saving result to history:', error);
    return false;
  }
};
