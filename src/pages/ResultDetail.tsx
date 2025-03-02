
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Calendar, Phone, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScreeningResult } from '@/services/screeningService';
import { supabase } from '@/lib/supabase';

// Define interface for medical history data structure
interface MedicalHistoryData {
  sociodemographic?: {
    education?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  lifestyle?: {
    smoking?: string;
    alcohol?: string;
    physicalActivity?: string;
  };
  medical?: {
    conditions?: string[] | string;
    symptoms?: string[] | string;
    reproductiveHistory?: string;
    lastVisaExamResults?: string;
  };
}

const ResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
          
          // For debugging - log the medical history
          if (data.patients?.medical_history) {
            console.log('Medical history raw:', data.patients.medical_history);
            
            // Try to parse if it's a string
            if (typeof data.patients.medical_history === 'string') {
              try {
                const parsed = JSON.parse(data.patients.medical_history) as MedicalHistoryData;
                console.log('Medical history parsed:', parsed);
                
                if (parsed.medical && parsed.medical.conditions) {
                  console.log('Medical conditions:', parsed.medical.conditions);
                }
                
                if (parsed.medical && parsed.medical.symptoms) {
                  console.log('Symptoms:', parsed.medical.symptoms);
                }
              } catch (e) {
                console.error('Error parsing medical history:', e);
              }
            } else {
              // It's already an object
              const medicalHistory = data.patients.medical_history as MedicalHistoryData;
              console.log('Medical history (object):', medicalHistory);
              
              if (medicalHistory.medical && 
                  medicalHistory.medical.conditions) {
                console.log('Medical conditions:', 
                  medicalHistory.medical.conditions);
              }
              
              if (medicalHistory.medical && 
                  medicalHistory.medical.symptoms) {
                console.log('Symptoms:', 
                  medicalHistory.medical.symptoms);
              }
            }
          }
          
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
      let medicalHistory: MedicalHistoryData;
      
      if (typeof medicalHistoryData === 'string') {
        try {
          medicalHistory = JSON.parse(medicalHistoryData) as MedicalHistoryData;
        } catch (e) {
          console.error('Error parsing medical history:', e);
          return <p className="text-red-500">Error parsing medical history</p>;
        }
      } else {
        medicalHistory = medicalHistoryData as unknown as MedicalHistoryData;
      }
      
      console.log('Formatting medical history:', JSON.stringify(medicalHistory, null, 2));
      
      return (
        <div className="space-y-3">
          {/* Patient Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Full Name</div>
              <div className="font-medium">{result.patients?.first_name} {result.patients?.last_name}</div>
              
              <div className="text-muted-foreground">Date of Birth</div>
              <div className="font-medium">
                {result.patients?.date_of_birth
                  ? format(new Date(result.patients.date_of_birth), 'MMM d, yyyy')
                  : 'Not available'}
              </div>
              
              <div className="text-muted-foreground">Contact Number</div>
              <div className="font-medium">{result.patients?.contact_number || 'Not available'}</div>
              
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{result.patients?.email || 'Not available'}</div>
            </div>
          </div>
          
          {/* Sociodemographic Data */}
          {medicalHistory.sociodemographic && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Sociodemographic Data</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Education</div>
                <div className="font-medium">{medicalHistory.sociodemographic.education || 'Not available'}</div>
                
                <div className="text-muted-foreground">Occupation</div>
                <div className="font-medium">{medicalHistory.sociodemographic.occupation || 'Not available'}</div>
                
                <div className="text-muted-foreground">Marital Status</div>
                <div className="font-medium">{medicalHistory.sociodemographic.maritalStatus || 'Not available'}</div>
              </div>
            </div>
          )}
          
          {/* Lifestyle Information */}
          {medicalHistory.lifestyle && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Lifestyle Factors</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Smoking</div>
                <div className="font-medium">{medicalHistory.lifestyle.smoking || 'Not available'}</div>
                
                <div className="text-muted-foreground">Alcohol</div>
                <div className="font-medium">{medicalHistory.lifestyle.alcohol || 'Not available'}</div>
                
                <div className="text-muted-foreground">Physical Activity</div>
                <div className="font-medium">{medicalHistory.lifestyle.physicalActivity || 'Not available'}</div>
              </div>
            </div>
          )}
          
          {/* Medical Information */}
          {medicalHistory.medical && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Medical Information</h3>
              
              {/* Medical Conditions */}
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Medical Conditions</div>
                <div className="font-medium">
                  {medicalHistory.medical.conditions && Array.isArray(medicalHistory.medical.conditions) ? (
                    medicalHistory.medical.conditions.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {medicalHistory.medical.conditions.map((condition: string, index: number) => (
                          <li key={index}>{condition}</li>
                        ))}
                      </ul>
                    ) : 'None'
                  ) : typeof medicalHistory.medical.conditions === 'string' ? 
                      medicalHistory.medical.conditions : 'None'}
                </div>
                
                {/* Symptoms */}
                <div className="text-muted-foreground">Symptoms</div>
                <div className="font-medium">
                  {medicalHistory.medical.symptoms && Array.isArray(medicalHistory.medical.symptoms) ? (
                    medicalHistory.medical.symptoms.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {medicalHistory.medical.symptoms.map((symptom: string, index: number) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    ) : 'None'
                  ) : typeof medicalHistory.medical.symptoms === 'string' ? 
                      medicalHistory.medical.symptoms : 'None'}
                </div>
                
                {/* Reproductive History */}
                {medicalHistory.medical.reproductiveHistory && (
                  <>
                    <div className="text-muted-foreground">Reproductive History</div>
                    <div className="font-medium">{medicalHistory.medical.reproductiveHistory}</div>
                  </>
                )}
                
                {/* Last Visa Exam Results */}
                {medicalHistory.medical.lastVisaExamResults && (
                  <>
                    <div className="text-muted-foreground">Last Visa Exam Results</div>
                    <div className="font-medium">{medicalHistory.medical.lastVisaExamResults}</div>
                  </>
                )}
              </div>
            </div>
          )}
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
          
          {/* Patient Information - Single Collapsible Section */}
          <div className="mt-6 mb-6">
            <Collapsible className="border rounded-md overflow-hidden">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-muted/30 hover:bg-muted/50 transition-all">
                <span className="font-medium">Patient Information and Medical History</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform ui-open:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 space-y-2">
                {result.patients?.medical_history ? (
                  formatMedicalHistory(result.patients.medical_history)
                ) : (
                  <p className="text-sm text-muted-foreground">No medical history available</p>
                )}
              </CollapsibleContent>
            </Collapsible>
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
