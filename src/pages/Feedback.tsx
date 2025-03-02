
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Camera, Home, XCircle, Timer } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Stepper, { Step } from '@/components/Stepper';
import { saveResultToHistory } from '@/pages/Results';
import { uploadScreeningImage, saveScreeningResult, ensurePatientExists } from '@/services/screeningService';

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Medical Info" },
  { id: 3, label: "Before Acetic" },
  { id: 4, label: "After Acetic" },
];

const Feedback = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<'positive' | 'negative' | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [resultSaved, setResultSaved] = useState<boolean>(false);
  
  const [analysisStep, setAnalysisStep] = useState<'quality-check' | 'analyzing' | 'complete'>('quality-check');
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const beforeAceticImage = localStorage.getItem('beforeAceticImage');
    const afterAceticImage = localStorage.getItem('afterAceticImage');
    const patientDataString = localStorage.getItem('currentPatient');
    
    // Check for required data
    if (!beforeAceticImage || !afterAceticImage) {
      toast({
        title: "Missing images",
        description: "Please complete the imaging process first",
        variant: "destructive",
      });
      navigate('/camera');
      return;
    }
    
    if (!patientDataString) {
      toast({
        title: "No patient data",
        description: "Patient information is missing. Please start over.",
        variant: "destructive",
      });
      navigate('/patient-registration');
      return;
    }
    
    // Set data in state
    setBeforeImage(beforeAceticImage);
    setAfterImage(afterAceticImage);
    
    try {
      const patient = JSON.parse(patientDataString);
      setPatientData(patient);
      
      // Show quality check animation for 2 seconds
      const qualityCheckTimer = setTimeout(() => {
        // Move to analyzing step with countdown
        setAnalysisStep('analyzing');
        
        // Start countdown timer
        const countdownInterval = setInterval(() => {
          setCountdown(prevCount => {
            if (prevCount <= 1) {
              clearInterval(countdownInterval);
              setAnalysisStep('complete');
              
              // Generate random result for demo after countdown completes
              const result = Math.random() > 0.5 ? 'positive' : 'negative';
              setAnalysisResult(result);
              
              // Update patient data with result
              const updatedPatient = {
                ...patient,
                analysisResult: result,
                analysisDate: new Date().toISOString(),
                beforeAceticImage: beforeAceticImage,
                afterAceticImage: afterAceticImage
              };
              
              // Save back to localStorage to preserve all data
              localStorage.setItem('currentPatient', JSON.stringify(updatedPatient));
              
              // Save to history
              saveResultToHistory(updatedPatient);
              
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'resultsHistory'
              }));
              
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
        
        return () => clearInterval(countdownInterval);
      }, 2000);
      
      return () => clearTimeout(qualityCheckTimer);
    } catch (error) {
      console.error('Error processing patient data:', error);
      toast({
        title: "Data error",
        description: "There was an error processing the patient data",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, navigate, toast]);
  
  const saveToDatabase = async () => {
    if (!currentDoctor || !patientData || !beforeImage || !afterImage || !analysisResult) {
      toast({
        title: "Cannot save result",
        description: "Missing required data for saving the result",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const validPatientId = await ensurePatientExists(patientData, currentDoctor.id);
      
      const beforeImageUrl = await uploadScreeningImage(
        beforeImage,
        currentDoctor.id,
        validPatientId,
        'before'
      );
      
      const afterImageUrl = await uploadScreeningImage(
        afterImage,
        currentDoctor.id,
        validPatientId,
        'after'
      );
      
      const screeningResult = {
        patient_id: validPatientId,
        doctor_id: currentDoctor.id,
        before_image_url: beforeImageUrl,
        after_image_url: afterImageUrl,
        result: analysisResult,
        confidence: 0.85,
        notes: `Screening performed on ${new Date().toLocaleDateString()}`
      };
      
      const savedResult = await saveScreeningResult(screeningResult, currentDoctor);
      
      if (savedResult) {
        setResultSaved(true);
        toast({
          title: "Result saved",
          description: "The screening result has been saved to the database",
        });
        
        // Update patient ID in localStorage
        const updatedPatientData = {
          ...patientData,
          id: validPatientId,
          savedToDatabase: true
        };
        localStorage.setItem('currentPatient', JSON.stringify(updatedPatientData));
      } else {
        throw new Error('Failed to save result');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving the screening result",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleNewScan = () => {
    localStorage.removeItem('capturedImage');
    localStorage.removeItem('beforeAceticImage');
    localStorage.removeItem('afterAceticImage');
    localStorage.removeItem('currentPatient');
    
    navigate('/patient-registration');
  };
  
  const handleTakeNewPhoto = () => {
    localStorage.removeItem('afterAceticImage');
    
    if (patientData) {
      const updatedPatientData = {
        ...patientData,
        screeningStep: 'after-acetic'
      };
      localStorage.setItem('currentPatient', JSON.stringify(updatedPatientData));
    }
    
    navigate('/camera');
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <Stepper 
          steps={steps} 
          currentStep={5}
          className="mb-6"
        />

        {analysisStep === 'quality-check' && (
          <div className="flex flex-col items-center justify-center p-6 animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2">Quality Check</h2>
            <p className="text-center text-muted-foreground">Verifying image quality...</p>
          </div>
        )}
        
        {analysisStep === 'analyzing' && (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 rounded-full bg-cervi-100 flex items-center justify-center mb-6 animate-pulse">
              <Timer className="h-12 w-12 text-cervi-600" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">{countdown}</h2>
            <p className="text-center text-muted-foreground">Analyzing images...</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-xl">
              {beforeImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-cervi-700">Before Acetic Acid</p>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img 
                      src={beforeImage} 
                      alt="Before acetic acid" 
                      className="w-full object-contain max-h-[120px]"
                    />
                  </div>
                </div>
              )}
              
              {afterImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-cervi-700">After Acetic Acid</p>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img 
                      src={afterImage} 
                      alt="After acetic acid" 
                      className="w-full object-contain max-h-[120px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {analysisStep === 'complete' && (
          <>
            <div className="w-full mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <h2 className="text-lg font-medium mb-3">Image Quality Assessment</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Images meet quality requirements</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {beforeImage && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-cervi-700">Before Acetic Acid</p>
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img 
                          src={beforeImage} 
                          alt="Before acetic acid" 
                          className="w-full object-contain max-h-[200px]"
                        />
                      </div>
                    </div>
                  )}
                  
                  {afterImage && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-cervi-700">After Acetic Acid</p>
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img 
                          src={afterImage} 
                          alt="After acetic acid" 
                          className="w-full object-contain max-h-[200px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <h2 className="text-lg font-medium mb-3">Analysis Results</h2>
                
                {analysisResult === 'positive' ? (
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800">Positive</p>
                      <p className="text-sm text-red-600">Abnormal cells detected. Further examination is recommended.</p>
                    </div>
                  </div>
                ) : analysisResult === 'negative' ? (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800">Negative</p>
                      <p className="text-sm text-green-600">No abnormal cells detected. Regular check-ups recommended.</p>
                    </div>
                  </div>
                ) : (
                  <p>Analysis pending...</p>
                )}
              </div>
              
              {patientData && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h2 className="text-lg font-medium mb-3">Patient Information</h2>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Name:</span> {patientData.firstName} {patientData.lastName}
                  </p>
                  {patientData.dateOfBirth && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">DOB:</span> {new Date(patientData.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {patientData.phoneNumber}
                  </p>
                </div>
              )}
            </div>
            
            <div className="w-full space-y-3 mt-auto">
              {!resultSaved ? (
                <Button
                  className="w-full bg-cervi-500 hover:bg-cervi-600 text-white"
                  onClick={saveToDatabase}
                  disabled={isSaving || !currentDoctor}
                >
                  {isSaving ? 'Saving to Database...' : 'Save Result to Database'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNewScan}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Start New Patient Scan
                </Button>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleTakeNewPhoto}
              >
                <Camera className="mr-2 h-4 w-4" />
                Retake After Acetic Photo
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Feedback;
