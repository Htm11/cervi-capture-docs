import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface CameraViewProps {
  onPhotoTaken: (imageDataUrl: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onPhotoTaken }) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      try {
        setIsCameraInitializing(true);
        setCameraError(null);
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        
        console.log('Browser detection:', { isIOS });
        
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        console.log('Requesting camera with constraints:', constraints);
        
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (!isMounted) return;
          
          console.log('Camera access granted');
          
          setStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.setAttribute('autoplay', 'true');
            videoRef.current.setAttribute('muted', 'true');
            
            videoRef.current.onloadedmetadata = () => {
              if (!videoRef.current || !isMounted) return;
              
              videoRef.current.play()
                .then(() => {
                  console.log('Video playback started');
                  setHasCamera(true);
                  setCameraError(null);
                })
                .catch(e => {
                  console.error('Error playing video:', e);
                  
                  if (isIOS) {
                    setCameraError('iOS requires user interaction. Please tap the screen or reload the page and grant camera permissions when prompted.');
                    toast({
                      title: "Camera permission issue",
                      description: "Please check your browser settings and try again.",
                      variant: "destructive",
                    });
                  } else {
                    setCameraError('Could not start video playback. Please reload and try again.');
                  }
                });
            };
          }
        } catch (err) {
          console.error('Camera access error:', err);
          
          if (!isMounted) return;
          
          if (isIOS) {
            setCameraError('Camera access denied. For iOS: Go to Settings > Safari > Camera (or Chrome > Camera) and enable access.');
          } else {
            setCameraError('Camera access denied. Please check your browser permissions.');
          }
          
          setHasCamera(false);
          
          toast({
            title: "Camera access denied",
            description: "Please enable camera access in your browser settings and reload.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Camera initialization error:', error);
        
        if (!isMounted) return;
        
        setCameraError('Could not initialize camera. Please ensure your device has a camera and you have granted permission.');
        setHasCamera(false);
      } finally {
        if (isMounted) {
          setIsCameraInitializing(false);
        }
      }
    };
    
    const timer = setTimeout(() => {
      initCamera();
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  const toggleFlashlight = async () => {
    if (!stream) return;
    
    const videoTrack = stream.getVideoTracks()[0];
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
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      if (isFlashlightOn) {
        toggleFlashlight();
      }
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onPhotoTaken(imageDataUrl);
    }
  };
  
  const handleRetryCamera = () => {
    setIsCameraInitializing(true);
    setHasCamera(false);
    setCameraError(null);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
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
            className="w-full h-full object-cover rounded-xl"
          />
          
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
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
  );
};

export default CameraView;
