
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  isAnalyzing: boolean;
  onProceed: () => void;
  onRetake: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageUrl, 
  isAnalyzing, 
  onProceed, 
  onRetake 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4 rounded-xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center shadow-lg">
        <img 
          src={imageUrl} 
          alt="Captured" 
          className="w-full h-full object-contain bg-black rounded-xl" 
          onError={(e) => {
            console.error('Error loading preview image:', e);
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="glass-dark text-white text-sm p-2 rounded-lg text-center">
            Review the image quality before proceeding
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mt-auto">
        <Button
          className="w-full bg-cervi-500 hover:bg-cervi-600 text-white"
          onClick={onProceed}
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
          onClick={onRetake}
          disabled={isAnalyzing}
        >
          Retake Photo
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
