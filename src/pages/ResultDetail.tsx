
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScreeningResult } from '@/services/screeningService';
import { supabase } from '@/lib/supabase';
import { 
  MedicalHistory, 
  PatientHeader, 
  ScreeningImages, 
  AnalysisResult, 
  Notes 
} from '@/components/result-detail';

// Define the type for the medical history explicitly
interface MedicalHistoryObject {
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
          
          if (data.patients?.medical_history) {
            console.log('Medical history raw:', data.patients.medical_history);
            
            if (typeof data.patients.medical_history === 'string') {
              try {
                const parsed = JSON.parse(data.patients.medical_history) as MedicalHistoryObject;
                console.log('Medical history parsed:', parsed);
                
                if (parsed && parsed.medical && parsed.medical.conditions) {
                  console.log('Medical conditions:', parsed.medical.conditions);
                  console.log('Is conditions an array:', Array.isArray(parsed.medical.conditions));
                  console.log('Conditions length:', Array.isArray(parsed.medical.conditions) ? parsed.medical.conditions.length : 'Not an array');
                }
                
                if (parsed && parsed.medical && parsed.medical.symptoms) {
                  console.log('Symptoms:', parsed.medical.symptoms);
                  console.log('Is symptoms an array:', Array.isArray(parsed.medical.symptoms));
                  console.log('Symptoms length:', Array.isArray(parsed.medical.symptoms) ? parsed.medical.symptoms.length : 'Not an array');
                }
              } catch (e) {
                console.error('Error parsing medical history:', e);
              }
            } else {
              const medicalHistory = data.patients.medical_history as MedicalHistoryObject;
              console.log('Medical history (object):', medicalHistory);
              
              if (medicalHistory && medicalHistory.medical && 
                  medicalHistory.medical.conditions) {
                console.log('Medical conditions:', 
                  medicalHistory.medical.conditions);
                console.log('Is conditions an array:', Array.isArray(medicalHistory.medical.conditions));
                console.log('Conditions length:', Array.isArray(medicalHistory.medical.conditions) ? medicalHistory.medical.conditions.length : 'Not an array');
              }
              
              if (medicalHistory && medicalHistory.medical && 
                  medicalHistory.medical.symptoms) {
                console.log('Symptoms:', 
                  medicalHistory.medical.symptoms);
                console.log('Is symptoms an array:', Array.isArray(medicalHistory.medical.symptoms));
                console.log('Symptoms length:', Array.isArray(medicalHistory.medical.symptoms) ? medicalHistory.medical.symptoms.length : 'Not an array');
              }
            }
          }
          
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
          <PatientHeader result={result} />
          <MedicalHistory result={result} />
          <ScreeningImages result={result} />
          <AnalysisResult result={result} />
          <Notes notes={result.notes} />
        </div>
      </div>
    </Layout>
  );
};

export default ResultDetail;
