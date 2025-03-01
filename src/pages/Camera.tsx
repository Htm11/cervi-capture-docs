
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Camera as CameraIcon, Lightbulb, Image, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Stepper, { Step } from '@/components/Stepper';
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
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
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
          track.stop();
        });
      }
    };
  }, [stream]);
  
  // Initialize camera - simplified implementation with better Safari support
  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      try {
        setIsCameraInitializing(true);
        setCameraError(null);
        
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }
        
        // Stop any existing streams
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        // Detect Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        console.log('Browser detected as Safari:', isSafari);
        
        // Camera constraints - simpler for initial request
        let constraints = {
          audio: false,
          video: true
        };
        
        console.log('Requesting camera with initial constraints:', constraints);
        
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (!isMounted) return;
          
          console.log('Initial camera access granted');
          
          // Now try to get a better quality stream with environment camera on mobile
          if (mediaStream && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            try {
              const betterConstraints = {
                audio: false,
                video: {
                  facingMode: { ideal: 'environment' },
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              };
              
              console.log('Attempting to get better camera with constraints:', betterConstraints);
              
              // First stop the initial stream
              mediaStream.getTracks().forEach(track => track.stop());
              
              const betterStream = await navigator.mediaDevices.getUserMedia(betterConstraints);
              setStream(betterStream);
              
              if (videoRef.current) {
                videoRef.current.srcObject = betterStream;
              }
            } catch (err) {
              console.warn('Could not get environment camera, falling back to initial stream:', err);
              
              // Fall back to the initial stream
              setStream(mediaStream);
              if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
              }
            }
          } else {
            // Not mobile or couldn't get better stream, use initial stream
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
          }
          
          // Set up video playback
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (!isMounted || !videoRef.current) return;
              
              videoRef.current.play()
                .then(() => {
                  console.log('Video playback started successfully');
                  setHasCamera(true);
                  setCameraError(null);
                })
                .catch(e => {
                  console.error('Error playing video:', e);
                  setCameraError('Could not start video playback. Please refresh and try again.');
                });
            };
          }
        } catch (err) {
          console.error('Camera access error:', err);
          
          if (!isMounted) return;
          
          setCameraError('Camera access denied or not available. Please check your permissions and try again.');
          setHasCamera(false);
          
          toast({
            title: "Camera access denied",
            description: "Please enable camera access in your browser settings and reload the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Camera initialization error:', error);
        
        if (!isMounted) return;
        
        setCameraError('Could not initialize camera. Please ensure your device has a camera and you've granted permission.');
        setHasCamera(false);
      } finally {
        if (isMounted) {
          setIsCameraInitializing(false);
        }
      }
    };
    
    // Small delay to ensure DOM is ready (helps on some mobile browsers)
    const timer = setTimeout(() => {
      initCamera();
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      // Clean up any active streams
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only run once on component mount
  
  // Toggle flashlight (if available)
  const toggleFlashlight = async () => {
    if (!stream) return;
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    
    try {
      // Check if flashlight is supported
      const capabilities = videoTrack.getCapabilities();
      console.log('Track capabilities:', capabilities);
      
      if (capabilities && 'torch' in capabilities) {
        const newFlashlightState = !isFlashlightOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: newFlashlightState }]
        });
        
        setIsFlashlightOn(newFlashlightState);
        toast({
          title: newFlashlightState ? "Flashlight On" : "Flashlight Off",
          duration: 1000,
        });
      } else {
        toast({
          title: "Flashlight not available",
          description: "Your device does not support flashlight control",
          variant: "destructive",
        });
      }
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
  
  // Retry camera initialization
  const handleRetryCamera = () => {
    // Force re-mount of component (simplified approach)
    setIsCameraInitializing(true);
    setHasCamera(false);
    setCameraError(null);
    
    // Stop any existing streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Wait a moment then re-initialize
    setTimeout(() => {
      window.location.reload();
    }, 300);
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
            <div className="text-white text-center p-4 flex flex-col items-center">
              {cameraError ? (
                <>
                  <p className="mb-4">{cameraError}</p>
                  <Button 
                    variant="secondary" 
                    onClick={handleRetryCamera}
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    Retry Camera Access
                  </Button>
                </>
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
