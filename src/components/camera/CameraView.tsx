import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Webcam from "react-webcam";

interface CameraViewProps {
  onPhotoTaken: (imageDataUrl: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onPhotoTaken }) => {
  const { toast } = useToast();
  const webcamRef = useRef<Webcam>(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  
  useEffect(() => {
    // Set camera as initialized after a short delay
    const timer = setTimeout(() => {
      setIsCameraInitializing(false);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Handle camera errors
  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera access error:', error);
    setCameraError('Camera access denied. Please check your browser permissions.');
    setHasCamera(false);
    
    toast({
      title: "Camera access denied",
      description: "Please enable camera access in your browser settings and reload.",
      variant: "destructive",
    });
  };
  
  // Handle successful camera initialization
  const handleUserMedia = (stream: MediaStream) => {
    console.log('Camera access granted');
    setHasCamera(true);
    setCameraError(null);
    
    // Check if flashlight is available
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();
      console.log('Track capabilities:', capabilities);
    }
  };
  
  const toggleFlashlight = async () => {
    if (!webcamRef.current?.stream) return;
    
    const videoTrack = webcamRef.current.stream.getVideoTracks()[0];
    if (!videoTrack) return;
    
    try {
      const capabilities = videoTrack.getCapabilities();
      console.log('Track capabilities:', capabilities);
      
      if (capabilities && 'torch' in capabilities) {
        const newFlashlightState = !isFlashlightOn;
        
        await videoTrack.applyConstraints({
          advanced: [{ 
            torch: newFlashlightState
          } as MediaTrackConstraintSet]
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
  
  const takePhoto = () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      if (isFlashlightOn) {
        toggleFlashlight();
      }
      
      onPhotoTaken(imageSrc);
    }
  };
  
  const handleRetryCamera = () => {
    setIsCameraInitializing(true);
    setHasCamera(false);
    setCameraError(null);
    
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  return (
    <div className="relative mb-4 rounded-xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center shadow-lg">
      {isCameraInitializing ? (
        <div className="text-white text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Initializing camera...</p>
        </div>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover rounded-xl"
            mirrored={false}
            screenshotQuality={0.8}
          />
          
          {hasCamera && (
            <>
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
              
              <div className="absolute bottom-4 left-0 right-0 px-4">
                <Button 
                  onClick={takePhoto}
                  className="w-full bg-cervi-500 hover:bg-cervi-600 text-white"
                >
                  Take Photo
                </Button>
              </div>
            </>
          )}
          
          {cameraError && (
            <div className="absolute inset-0 bg-black/80 text-white text-center p-4 flex flex-col items-center justify-center">
              <p className="mb-4">{cameraError}</p>
              <Button 
                variant="secondary" 
                onClick={handleRetryCamera}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Retry Camera Access
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraView;
