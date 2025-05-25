import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, Calendar, Phone, Trash2, Download, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
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

export const saveResultToHistory = (patient: any) => {
  try {
    const resultsHistory = localStorage.getItem('resultsHistory');
    let history = resultsHistory ? JSON.parse(resultsHistory) : [];
    
    history.push({
      ...patient,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('resultsHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

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
    if (!result.patients) return false;
    
    const patientName = `${result.patients.first_name || ''} ${result.patients.last_name || ''}`.toLowerCase();
    const patientId = result.patients.unique_id || '';
    const contactNumber = result.patients.contact_number || '';
    
    return patientName.includes(searchTerm.toLowerCase()) || 
           patientId.includes(searchTerm.toLowerCase()) ||
           contactNumber.includes(searchTerm);
  });
  
  const handleResultClick = (result: ScreeningResult) => {
    if (result.id) {
      console.log('Navigating to result detail:', result.id);
      navigate(`/results/${result.id}`);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };
  
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const success = await deleteScreeningResult(deleteId);
      
      if (success) {
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

  const handleExportToExcel = () => {
    try {
      const excelData = filteredResults.map(result => ({
        'Patient ID': result.patients?.unique_id || 'N/A',
        'Contact Number': result.patients?.contact_number || 'N/A',
        'Result': result.result || 'N/A',
        'Screening Date': result.created_at ? format(new Date(result.created_at), 'MMM d, yyyy') : 'N/A',
        'Notes': result.notes || 'N/A'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      XLSX.utils.book_append_sheet(wb, ws, 'Screening Results');

      const fileName = `screening_results_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Export successful",
        description: "Your screening results have been exported to Excel.",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your results to Excel.",
        variant: "destructive",
      });
    }
  };

  const ImageThumbnail = ({ imageUrl, altText }: { imageUrl?: string; altText: string }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (!imageUrl || imageError) {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <Image className="h-6 w-6 text-gray-400" />
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={altText}
        className={`w-16 h-16 object-cover rounded-lg transition-opacity ${
          imageLoading ? 'opacity-50' : 'opacity-100'
        }`}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => setImageLoading(false)}
      />
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Patient Results History</h1>
          <Button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={filteredResults.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by patient ID, name or phone number"
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
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">
                          {result.patients?.unique_id || 'No ID'}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{result.patients?.contact_number || 'No phone number'}</span>
                        </div>
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

                    {/* Image previews section */}
                    {(result.before_image_url || result.after_image_url || result.image_url) && (
                      <div className="flex gap-2 mb-3">
                        {result.before_image_url && (
                          <div className="flex flex-col items-center">
                            <ImageThumbnail 
                              imageUrl={result.before_image_url} 
                              altText="Before screening" 
                            />
                            <span className="text-xs text-gray-500 mt-1">Before</span>
                          </div>
                        )}
                        {result.after_image_url && (
                          <div className="flex flex-col items-center">
                            <ImageThumbnail 
                              imageUrl={result.after_image_url} 
                              altText="After screening" 
                            />
                            <span className="text-xs text-gray-500 mt-1">After</span>
                          </div>
                        )}
                        {result.image_url && !result.before_image_url && !result.after_image_url && (
                          <div className="flex flex-col items-center">
                            <ImageThumbnail 
                              imageUrl={result.image_url} 
                              altText="Screening image" 
                            />
                            <span className="text-xs text-gray-500 mt-1">Image</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {result.created_at 
                          ? format(new Date(result.created_at), 'MMM d, yyyy') 
                          : 'Date not available'}
                      </span>
                    </div>
                  </div>
                </div>
                
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
