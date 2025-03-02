
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreeningResult } from '@/services/screeningService';
import { supabase } from '@/lib/supabase';

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
          
          <div className="mb-6">
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
