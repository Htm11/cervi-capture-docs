
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Camera, Home } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Feedback = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  
  // Animation state
  const [showAnimation, setShowAnimation] = useState(true);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Get captured image from local storage
    const capturedImage = localStorage.getItem('capturedImage');
    if (!capturedImage) {
      toast({
        title: "No image captured",
        description: "Please capture an image first",
        variant: "destructive",
      });
      navigate('/camera');
      return;
    }
    
    setImageUrl(capturedImage);
    
    // Get patient data from local storage
    const patientDataString = localStorage.getItem('currentPatient');
    if (patientDataString) {
      setPatientData(JSON.parse(patientDataString));
    }
    
    // Hide animation after delay
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, toast]);
  
  const handleNewScan = () => {
    // Clear current patient and image
    localStorage.removeItem('capturedImage');
    
    // Navigate to patient registration
    navigate('/patient-registration');
  };
  
  const handleTakeNewPhoto = () => {
    // Clear only the image
    localStorage.removeItem('capturedImage');
    
    // Navigate back to camera
    navigate('/camera');
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        {showAnimation ? (
          <div className="flex flex-col items-center justify-center p-6 animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2">Analysis Complete</h2>
            <p className="text-center text-muted-foreground">Your image has been analyzed and meets the quality requirements</p>
          </div>
        ) : (
          <>
            <div className="w-full mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <h2 className="text-lg font-medium mb-3">Image Quality Assessment</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Image meets quality requirements</span>
                </div>
                
                {imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img 
                      src={imageUrl} 
                      alt="Captured image" 
                      className="w-full object-contain max-h-[300px]"
                    />
                  </div>
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
                Take Another Photo
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Feedback;
