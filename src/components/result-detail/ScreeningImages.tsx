
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreeningResult } from '@/services/screeningService';

interface ScreeningImagesProps {
  result: ScreeningResult;
}

const ScreeningImages = ({ result }: ScreeningImagesProps) => {
  return (
    <>
      <h2 className="text-md font-medium mb-3">Screening Images</h2>
      <Tabs defaultValue="before-acetic">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="before-acetic" className="flex-1">Before Acetic Acid</TabsTrigger>
          <TabsTrigger value="after-acetic" className="flex-1">After Acetic Acid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="before-acetic" className="pt-2">
          {result.before_image_url ? (
            <div className="border border-border rounded-lg overflow-hidden bg-black flex items-center justify-center">
              <img 
                src={result.before_image_url} 
                alt="Before acetic acid" 
                className="w-full object-contain max-h-[300px]"
                onError={(e) => {
                  console.error('Error loading before image:', e);
                  const imgElement = e.currentTarget as HTMLImageElement;
                  console.log('Failed image URL:', imgElement.src);
                  imgElement.src = '/placeholder.svg';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
              <p className="text-muted-foreground">No before image available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="after-acetic" className="pt-2">
          {result.after_image_url ? (
            <div className="border border-border rounded-lg overflow-hidden bg-black flex items-center justify-center">
              <img 
                src={result.after_image_url} 
                alt="After acetic acid" 
                className="w-full object-contain max-h-[300px]"
                onError={(e) => {
                  console.error('Error loading after image:', e);
                  const imgElement = e.currentTarget as HTMLImageElement;
                  console.log('Failed image URL:', imgElement.src);
                  imgElement.src = '/placeholder.svg';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
              <p className="text-muted-foreground">No after image available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ScreeningImages;
