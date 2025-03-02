
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Camera, Home, Image as ImageIcon, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Stepper, { Step } from '@/components/Stepper';

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Medical Info" },
  { id: 3, label: "Before Acetic" },
  { id: 4, label: "After Acetic" },
];

const Feedback = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<'positive' | 'negative' | null>(null);
  
  // Animation state
  const [showAnimation, setShowAnimation] = useState(true);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Get captured images from local storage
    const beforeAceticImage = localStorage.getItem('beforeAceticImage');
    const afterAceticImage = localStorage.getItem('afterAceticImage');
    
    if (!beforeAceticImage || !afterAceticImage) {
      toast({
        title: "Missing images",
        description: "Please complete the imaging process first",
        variant: "destructive",
      });
      navigate('/camera');
      return;
    }
    
    setBeforeImage(beforeAceticImage);
    setAfterImage(afterAceticImage);
    
    // Get patient data from local storage
    const patientDataString = localStorage.getItem('currentPatient');
    if (patientDataString) {
      setPatientData(JSON.parse(patientDataString));
    }
    
    // Simulate analysis result - in real app, this would come from an API
    // For demo purposes, randomly set as positive or negative
    const result = Math.random() > 0.5 ? 'positive' : 'negative';
    setAnalysisResult(result);
    
    // Save result to patient data
    if (patientDataString) {
      const patient = JSON.parse(patientDataString);
      const updatedPatient = {
        ...patient,
        analysisResult: result,
        analysisDate: new Date().toISOString()
      };
      
      // Save updated patient data
      localStorage.setItem('currentPatient', JSON.stringify(updatedPatient));
      
      // Save to results history
      const resultsHistory = JSON.parse(localStorage.getItem('resultsHistory') || '[]');
      
      // Check if this patient result already exists
      const existingIndex = resultsHistory.findIndex((p: any) => 
        p.id === updatedPatient.id || 
        (p.firstName === updatedPatient.firstName && 
         p.lastName === updatedPatient.lastName && 
         p.phoneNumber === updatedPatient.phoneNumber)
      );
      
      if (existingIndex >= 0) {
        // Update existing record
        resultsHistory[existingIndex] = updatedPatient;
      } else {
        // Add new record
        resultsHistory.push(updatedPatient);
      }
      
      localStorage.setItem('resultsHistory', JSON.stringify(resultsHistory));
    }
    
    // Hide animation after delay
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, toast]);
  
  const handleNewScan = () => {
    // Clear current patient and images
    localStorage.removeItem('capturedImage');
    localStorage.removeItem('beforeAceticImage');
    localStorage.removeItem('afterAceticImage');
    localStorage.removeItem('currentPatient');
    
    // Navigate to patient registration
    navigate('/patient-registration');
  };
  
  const handleTakeNewPhoto = () => {
    // Clear only the after acetic acid image
    localStorage.removeItem('afterAceticImage');
    
    // Update patient data to go back to after acetic step
    if (patientData) {
      const updatedPatientData = {
        ...patientData,
        screeningStep: 'after-acetic'
      };
      localStorage.setItem('currentPatient', JSON.stringify(updatedPatientData));
    }
    
    // Navigate back to camera
    navigate('/camera');
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <Stepper 
          steps={steps} 
          currentStep={5} // Set to a number beyond the last step to mark all as completed
          className="mb-6"
        />

        {showAnimation ? (
          <div className="flex flex-col items-center justify-center p-6 animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2">Analysis Complete</h2>
            <p className="text-center text-muted-foreground">Your images have been analyzed and meet the quality requirements</p>
          </div>
        ) : (
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
              
              {/* Analysis Results */}
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
              <Button
                className="w-full bg-cervi-500 hover:bg-cervi-600 text-white"
                onClick={handleNewScan}
              >
                <Home className="mr-2 h-4 w-4" />
                Start New Patient Scan
              </Button>
              
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
