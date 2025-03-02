
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Stepper, { Step } from '@/components/Stepper';
import CameraView from '@/components/camera/CameraView';
import ImagePreview from '@/components/camera/ImagePreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Medical Info" },
  { id: 3, label: "Before Acetic" },
  { id: 4, label: "After Acetic" },
];

const Camera = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(3); // Default to "Before Acetic"
  const [showAceticAcidDialog, setShowAceticAcidDialog] = useState(false);
  
  // Check authentication and get patient data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if we have patient data
    const storedPatientData = localStorage.getItem('currentPatient');
    if (!storedPatientData) {
      toast({
        title: "No patient data",
        description: "Please register a patient first",
        variant: "destructive",
      });
      navigate('/patient-registration');
      return;
    }
    
    const parsedData = JSON.parse(storedPatientData);
    setPatientData(parsedData);
    
    // Set current step based on screening step
    if (parsedData.screeningStep === 'after-acetic') {
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  }, [isAuthenticated, navigate, toast]);
  
  const handlePhotoTaken = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setPhotoTaken(true);
  };
  
  const resetCamera = () => {
    setPhotoTaken(false);
    setCapturedImage(null);
  };
  
  const analyzeImage = () => {
    if (!capturedImage || !patientData) return;
    
    setIsAnalyzing(true);
    
    // Simulate image analysis
    setTimeout(() => {
      // Save the image based on current step
      if (currentStep === 3) {
        // Before acetic acid
        localStorage.setItem('beforeAceticImage', capturedImage || '');
        
        // Update patient data with new step
        const updatedPatientData = {
          ...patientData,
          screeningStep: 'after-acetic'
        };
        localStorage.setItem('currentPatient', JSON.stringify(updatedPatientData));
        
        setIsAnalyzing(false);
        setShowAceticAcidDialog(true);
      } else {
        // After acetic acid
        localStorage.setItem('afterAceticImage', capturedImage || '');
        
        // For demo, also set capturedImage to ensure compatibility with feedback page
        localStorage.setItem('capturedImage', capturedImage || '');
        
        setIsAnalyzing(false);
        navigate('/feedback');
      }
    }, 2000);
  };
  
  const handleAceticAcidConfirm = () => {
    setShowAceticAcidDialog(false);
    setPhotoTaken(false);
    setCapturedImage(null);
    setCurrentStep(4);
  };
  
  const handleBackToForm = () => {
    navigate('/patient-registration');
  };
  
  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      if (step <= 2) {
        navigate('/patient-registration');
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <Stepper 
          steps={steps} 
          currentStep={currentStep}
          onStepClick={handleStepClick}
          className="mb-6"
        />
        
        <div className="mb-4 bg-cervi-50 rounded-lg p-3 text-sm text-cervi-800">
          {currentStep === 3 ? (
            <p><strong>Step 1:</strong> Take a clear image <strong>before</strong> applying acetic acid</p>
          ) : (
            <p><strong>Step 2:</strong> Take a clear image <strong>after</strong> applying acetic acid</p>
          )}
        </div>
        
        {!photoTaken ? (
          <>
            <CameraView onPhotoTaken={handlePhotoTaken} />
            
            <div className="mt-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBackToForm}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patient Data
              </Button>
            </div>
          </>
        ) : (
          capturedImage && (
            <ImagePreview 
              imageUrl={capturedImage}
              isAnalyzing={isAnalyzing}
              onProceed={analyzeImage}
              onRetake={resetCamera}
            />
          )
        )}
      </div>
      
      <AlertDialog open={showAceticAcidDialog} onOpenChange={setShowAceticAcidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Acetic Acid</AlertDialogTitle>
            <AlertDialogDescription>
              Please apply acetic acid to the cervix now. Wait 1 minute after application before taking the next photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAceticAcidConfirm}>
              Continue to Next Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Camera;
