
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Calendar, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScreeningResult } from '@/services/screeningService';
import { supabase } from '@/lib/supabase';

const ResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientInfoOpen, setIsPatientInfoOpen] = useState(false);
  
  useEffect(() => {
    const fetchResultDetail = async () => {
      setIsLoading(true);
      
      try {
        if (!resultId) {
          toast({
            title: "Missing result ID",
            description: "No result ID was provided",
            variant: "destructive",
          });
          navigate('/results');
          return;
        }
        
        const { data, error } = await supabase
          .from('screening_results')
          .select('*, patients!inner(*)')
          .eq('id', resultId)
          .single();
          
        if (error) {
          console.error('Error fetching result detail:', error);
          throw error;
        }
        
        if (data) {
          console.log('Loaded result detail:', data);
          
          // Ensure the image URLs are properly formed
          if (data.before_image_url) {
            console.log('Before image URL:', data.before_image_url);
          }
          
          if (data.after_image_url) {
            console.log('After image URL:', data.after_image_url);
          }
          
          setResult(data as ScreeningResult);
        } else {
          toast({
            title: "Result not found",
            description: "The requested screening result could not be found",
            variant: "destructive",
          });
          navigate('/results');
        }
      } catch (error) {
        console.error('Error in fetchResultDetail:', error);
        toast({
          title: "Error loading result",
          description: "There was a problem loading the screening result",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResultDetail();
  }, [resultId, navigate, toast]);
  
  const goBack = () => {
    navigate('/results');
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-cervi-500 rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }
  
  if (!result) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground">Result not found</p>
          <Button 
            className="mt-4 bg-cervi-500 hover:bg-cervi-600 text-white"
            onClick={goBack}
          >
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }
  
  const formatMedicalHistory = (medicalHistoryData: string | null) => {
    if (!medicalHistoryData) return null;
    
    try {
      const medicalHistory = typeof medicalHistoryData === 'string' 
        ? JSON.parse(medicalHistoryData) 
        : medicalHistoryData;
      
      // Helper function to render nested values recursively
      const renderNestedValue = (value: any): React.ReactNode => {
        if (value === null || value === undefined) {
          return "None";
        } else if (Array.isArray(value)) {
          // Improved array handling - this will properly show conditions arrays
          return value.length > 0 ? value.join(', ') : "None";
        } else if (typeof value === 'object') {
          return (
            <div className="pl-4 space-y-2 mt-2 text-sm">
              {Object.entries(value).map(([nestedKey, nestedValue]) => {
                if (nestedValue === null || nestedValue === undefined || 
                   (Array.isArray(nestedValue) && nestedValue.length === 0)) {
                  return null;
                }
                
                const displayKey = nestedKey.replace(/_/g, ' ');
                const displayValue = typeof nestedValue === 'boolean'
                  ? (nestedValue ? 'Yes' : 'No')
                  : nestedValue;
                
                return (
                  <div key={nestedKey} className="flex justify-between items-start mb-1">
                    <span className="text-muted-foreground capitalize">{displayKey}</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {typeof displayValue === 'object' ? renderNestedValue(displayValue) : String(displayValue)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        } else if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        } else {
          return String(value);
        }
      };
      
      return (
        <div className="space-y-4">
          {Object.entries(medicalHistory).map(([sectionKey, sectionValue]) => {
            if (!sectionValue || (typeof sectionValue === 'object' && Object.keys(sectionValue).length === 0)) 
              return null;
            
            // Create a collapsible section for each main category
            return (
              <Collapsible key={sectionKey} className="border rounded-md overflow-hidden">
                <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-muted/30 hover:bg-muted/50 transition-all">
                  <span className="font-medium capitalize">{sectionKey.replace(/_/g, ' ')}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 space-y-2">
                  {typeof sectionValue === 'object' ? (
                    Object.entries(sectionValue as Record<string, any>).map(([key, value]) => {
                      // Skip null, undefined, or empty arrays
                      if (value === null || value === undefined || 
                         (Array.isArray(value) && value.length === 0)) {
                        return null;
                      }
                      
                      // Special handling for medical.conditions array
                      if (key === 'conditions' && Array.isArray(value)) {
                        return (
                          <div key={key} className="space-y-2">
                            <h4 className="text-sm font-medium capitalize">Medical Conditions</h4>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Conditions</span>
                              <span className="font-medium">{value.join(', ')}</span>
                            </div>
                          </div>
                        );
                      }
                      
                      // Special handling for medical.symptoms array
                      if (key === 'symptoms' && Array.isArray(value)) {
                        return (
                          <div key={key} className="space-y-2">
                            <h4 className="text-sm font-medium capitalize">Symptoms</h4>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Symptoms</span>
                              <span className="font-medium">{value.join(', ')}</span>
                            </div>
                          </div>
                        );
                      }
                      
                      // For nested objects (like conditions in medical section)
                      if (key === 'conditions' && typeof value === 'object' && !Array.isArray(value)) {
                        return (
                          <div key={key} className="space-y-2">
                            <h4 className="text-sm font-medium capitalize">Medical Conditions</h4>
                            <div className="space-y-1">
                              {Object.entries(value as Record<string, any>).map(([conditionKey, conditionValue]) => {
                                // Skip false/null conditions
                                if (!conditionValue) return null;
                                
                                return (
                                  <div key={conditionKey} className="flex justify-between items-center">
                                    <span className="text-muted-foreground capitalize">{conditionKey.replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{typeof conditionValue === 'boolean' ? 'Yes' : String(conditionValue)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      
                      // For other nested objects
                      if (typeof value === 'object' && !Array.isArray(value)) {
                        return (
                          <div key={key} className="space-y-1">
                            <h4 className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</h4>
                            <div className="space-y-1">
                              {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => {
                                if (subValue === null || subValue === undefined) return null;
                                
                                return (
                                  <div key={subKey} className="flex justify-between items-center">
                                    <span className="text-muted-foreground capitalize">{subKey.replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{typeof subValue === 'boolean' ? (subValue ? 'Yes' : 'No') : String(subValue)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      
                      // For simple key-value pairs
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                             Array.isArray(value) ? value.join(', ') :
                             typeof value === 'object' ? renderNestedValue(value) : String(value)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{sectionKey.replace(/_/g, ' ')}</span>
                      <span className="font-medium">
                        {typeof sectionValue === 'boolean' ? (sectionValue ? 'Yes' : 'No') : String(sectionValue)}
                      </span>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      );
    } catch (e) {
      console.error('Error formatting medical history:', e);
      return <p className="text-red-500">Error displaying medical history: {(e as Error).message}</p>;
    }
  };
  
  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-semibold">
                {result.patients?.first_name} {result.patients?.last_name}
              </h1>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3 mr-1" />
                <span>{result.patients?.contact_number || 'No phone number'}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {result.created_at 
                    ? format(new Date(result.created_at), 'MMM d, yyyy') 
                    : 'Date not available'}
                </span>
              </div>
            </div>
            
            {result.result === 'positive' ? (
              <div className="flex items-center text-red-500 bg-red-50 py-1 px-3 rounded-full">
                <XCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Positive</span>
              </div>
            ) : (
              <div className="flex items-center text-green-500 bg-green-50 py-1 px-3 rounded-full">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Negative</span>
              </div>
            )}
          </div>
          
          {/* Basic Patient Information */}
          <div className="mb-4">
            <h2 className="text-md font-medium mb-2">Patient Information</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p>{result.patients?.first_name} {result.patients?.last_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p>
                  {result.patients?.date_of_birth
                    ? format(new Date(result.patients.date_of_birth), 'MMM d, yyyy')
                    : 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact Number</p>
                <p>{result.patients?.contact_number || 'Not available'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{result.patients?.email || 'Not available'}</p>
              </div>
            </div>
          </div>
          
          {/* Detailed Medical History - Collapsible Section */}
          <div className="mt-6 mb-6">
            <h2 className="text-md font-medium mb-3">Medical History</h2>
            {result.patients?.medical_history ? (
              formatMedicalHistory(result.patients.medical_history)
            ) : (
              <p className="text-sm text-muted-foreground">No medical history available</p>
            )}
          </div>
          
          <h2 className="text-md font-medium mb-3">Screening Images</h2>
          <Tabs defaultValue="before-acetic">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="before-acetic" className="flex-1">Before Acetic Acid</TabsTrigger>
              <TabsTrigger value="after-acetic" className="flex-1">After Acetic Acid</TabsTrigger>
            </TabsList>
            
            <TabsContent value="before-acetic" className="pt-2">
              {result.before_image_url ? (
                <div className="border border-border rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <img 
                    src={result.before_image_url} 
                    alt="Before acetic acid" 
                    className="w-full object-contain max-h-[300px]"
                    onError={(e) => {
                      console.error('Error loading before image:', e);
                      const imgElement = e.currentTarget as HTMLImageElement;
                      console.log('Failed image URL:', imgElement.src);
                      imgElement.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No before image available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="after-acetic" className="pt-2">
              {result.after_image_url ? (
                <div className="border border-border rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <img 
                    src={result.after_image_url} 
                    alt="After acetic acid" 
                    className="w-full object-contain max-h-[300px]"
                    onError={(e) => {
                      console.error('Error loading after image:', e);
                      const imgElement = e.currentTarget as HTMLImageElement;
                      console.log('Failed image URL:', imgElement.src);
                      imgElement.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No after image available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <h2 className="text-md font-medium mb-2">Analysis Result</h2>
            {result.result === 'positive' ? (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <p className="font-medium text-red-800">Positive</p>
                </div>
                <p className="text-sm text-red-600">
                  Abnormal cells detected. Further examination is recommended.
                </p>
                {result.confidence && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="font-medium text-green-800">Negative</p>
                </div>
                <p className="text-sm text-green-600">
                  No abnormal cells detected. Regular check-ups recommended.
                </p>
                {result.confidence && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            )}
          </div>
          
          {result.notes && (
            <div className="mt-6">
              <h2 className="text-md font-medium mb-2">Notes</h2>
              <p className="text-sm text-muted-foreground">{result.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResultDetail;
