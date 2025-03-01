
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Camera as CameraIcon, Lightbulb, Image, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Stepper, { Step } from '@/components/Stepper';
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

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Medical Info" },
  { id: 3, label: "Before Acetic" },
  { id: 4, label: "After Acetic" },
];

const Camera = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(3); // Default to "Before Acetic"
  const [showAceticAcidDialog, setShowAceticAcidDialog] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  
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
  
  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track);
          track.stop();
        });
      }
    };
  }, [stream]);
  
  // Initialize camera - improved implementation for mobile compatibility
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsCameraInitializing(true);
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }
        
        // First stop any existing streams
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        // Mobile-friendly constraints
        const constraints = {
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        console.log('Attempting to access camera with constraints:', constraints);
        
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Camera access granted:', mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            
            // Wait for video to be ready before playing
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    console.log('Video playback started successfully');
                    setHasCamera(true);
                    setCameraError(null);
                  })
                  .catch(e => {
                    console.error('Error playing video:', e);
                    setCameraError('Failed to start video playback. Please try again.');
                  });
              }
            };
            
            setStream(mediaStream);
          }
        } catch (err) {
          console.error('Initial camera access failed:', err);
          
          // Fallback to basic video constraints if the initial attempt fails
          const fallbackConstraints = { 
            video: true, 
            audio: false 
          };
          
          console.log('Trying fallback constraints:', fallbackConstraints);
          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    console.log('Video playback started with fallback constraints');
                    setHasCamera(true);
                    setCameraError(null);
                  })
                  .catch(e => {
                    console.error('Error playing video with fallback:', e);
                    setCameraError('Failed to start video stream with fallback settings');
                  });
              }
            };
            
            setStream(fallbackStream);
          }
        }
      } catch (error) {
        console.error('All camera access attempts failed:', error);
        setCameraError('Camera access denied or not available. Please check your permissions.');
        setHasCamera(false);
      } finally {
        setIsCameraInitializing(false);
      }
    };
    
    initCamera();
  }, []);
  
  // Toggle flashlight (if available)
  const toggleFlashlight = async () => {
    if (!stream) return;
    
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    
    try {
      // Try the standard approach first (works on some Android devices)
      try {
        const capabilities = track.getCapabilities();
        console.log('Track capabilities:', capabilities);
        
        // Check if torch is supported
        if (capabilities && 'torch' in capabilities) {
          const torchOn = !isFlashlightOn;
          await track.applyConstraints({
            advanced: [{ torch: torchOn } as any]
          });
          
          setIsFlashlightOn(torchOn);
          toast({
            title: torchOn ? "Flashlight On" : "Flashlight Off",
            duration: 1000,
          });
          return;
        }
      } catch (e) {
        console.error('Standard flashlight method failed:', e);
      }
      
      // Try ImageCapture API (works on some browsers)
      if ('ImageCapture' in window) {
        try {
          const imageCapture = new (window as any).ImageCapture(track);
          
          if (imageCapture.getPhotoCapabilities) {
            const capabilities = await imageCapture.getPhotoCapabilities();
            
            if (capabilities && capabilities.fillLightMode && 
                capabilities.fillLightMode.includes('flash')) {
              const flashMode = isFlashlightOn ? 'off' : 'flash';
              await imageCapture.setOptions({ fillLightMode: flashMode });
              
              setIsFlashlightOn(!isFlashlightOn);
              toast({
                title: isFlashlightOn ? "Flashlight Off" : "Flashlight On",
                duration: 1000,
              });
              return;
            }
          }
        } catch (e) {
          console.error('ImageCapture flashlight method failed:', e);
        }
      }
      
      // If we get here, flashlight isn't available
      toast({
        title: "Flashlight not available",
        description: "Your device does not support flashlight control",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      toast({
        title: "Flashlight error",
        description: "Could not toggle the flashlight",
        variant: "destructive",
      });
    }
  };
  
  // Take photo
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoTaken(true);
      
      // Turn off flashlight if it's on
      if (isFlashlightOn) {
        toggleFlashlight();
      }
    }
  };
  
  // Reset camera
  const resetCamera = () => {
    setPhotoTaken(false);
  };
  
  // Analyze image quality
  const analyzeImage = () => {
    if (!canvasRef.current || !patientData) return;
    
    setIsAnalyzing(true);
    
    // Simulate image analysis (in a real app, this would be an actual algorithm)
    setTimeout(() => {
      const imageDataUrl = canvasRef.current?.toDataURL('image/jpeg');
      
      // Save the image based on current step
      if (currentStep === 3) {
        // Before acetic acid
        localStorage.setItem('beforeAceticImage', imageDataUrl || '');
        
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
        localStorage.setItem('afterAceticImage', imageDataUrl || '');
        
        // For demo, also set capturedImage to ensure compatibility with feedback page
        localStorage.setItem('capturedImage', imageDataUrl || '');
        
        setIsAnalyzing(false);
        navigate('/feedback');
      }
    }, 2000);
  };
  
  const handleAceticAcidConfirm = () => {
    setShowAceticAcidDialog(false);
    setPhotoTaken(false);  // Reset to camera view
    setCurrentStep(4);     // Move to next step
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
        
        <div className="relative mb-4 rounded-xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center shadow-lg">
          {isCameraInitializing ? (
            <div className="text-white text-center flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Initializing camera...</p>
            </div>
          ) : hasCamera ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover rounded-xl",
                  photoTaken ? "hidden" : "block"
                )}
              />
              
              <canvas
                ref={canvasRef}
                className={cn(
                  "w-full h-full object-contain bg-black rounded-xl",
                  photoTaken ? "block" : "hidden"
                )}
              />
              
              {!photoTaken && (
                <div className="absolute top-4 right-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30"
                    onClick={toggleFlashlight}
                  >
                    <Lightbulb className={cn(
                      "h-5 w-5",
                      isFlashlightOn ? "text-yellow-300" : "text-white"
                    )} />
                  </Button>
                </div>
              )}
              
              {photoTaken && (
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <div className="glass-dark text-white text-sm p-2 rounded-lg text-center">
                    Review the image quality before proceeding
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-white text-center p-4">
              {cameraError ? (
                <p>{cameraError}</p>
              ) : (
                <p>Camera not available</p>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-3 mt-auto">
          {!photoTaken ? (
            <>
              <Button
                className="w-full bg-cervi-500 hover:bg-cervi-600 text-white h-14 text-lg"
                disabled={!hasCamera || !!cameraError || isCameraInitializing}
                onClick={takePhoto}
              >
                <CameraIcon className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBackToForm}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patient Data
              </Button>
            </>
          ) : (
            <>
              <Button
                className="w-full bg-cervi-500 hover:bg-cervi-600 text-white"
                onClick={analyzeImage}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing image quality...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Proceed with this Image
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={resetCamera}
                disabled={isAnalyzing}
              >
                Retake Photo
              </Button>
            </>
          )}
        </div>
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
