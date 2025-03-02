import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
}

const Header = ({ showBackButton }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // If showBackButton prop is provided, use that value
  // Otherwise, determine based on the current route
  const shouldShowBackButton = showBackButton !== undefined 
    ? showBackButton 
    : (location.pathname !== '/' && location.pathname !== '/login');

  return (
    <header className="w-full backdrop-blur-md bg-white/80 border-b border-border sticky top-0 z-10">
      <div className="max-w-screen-md mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {shouldShowBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-medium text-foreground">
            {getHeaderTitle(location.pathname)}
          </h1>
        </div>
      </div>
    </header>
  );
};

// Helper function to get the title based on the current route
const getHeaderTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
    case '/login':
      return 'Cervi Scanner';
    case '/patient-registration':
      return 'Patient Registration';
    case '/camera':
      return 'Image Capture';
    case '/feedback':
      return 'Image Feedback';
    default:
      return 'Cervi Scanner';
  }
};

export default Header;
