
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which menu item is active
  const isNewScanActive = location.pathname === '/patient-registration' || location.pathname === '/camera' || location.pathname === '/feedback';
  const isResultsActive = location.pathname === '/results';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white border-t border-border shadow-sm z-30">
      <div className="max-w-screen-md mx-auto flex justify-around">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 flex flex-col h-16 rounded-lg",
            isNewScanActive && "bg-cervi-50 text-cervi-700"
          )}
          onClick={() => navigate('/patient-registration')}
        >
          <Camera className="h-5 w-5 mb-1" />
          <span className="text-xs">New Scan</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "flex-1 flex flex-col h-16 rounded-lg",
            isResultsActive && "bg-cervi-50 text-cervi-700"
          )}
          onClick={() => navigate('/results')}
        >
          <List className="h-5 w-5 mb-1" />
          <span className="text-xs">Results</span>
        </Button>
      </div>
    </div>
  );
};

export default BottomMenu;
