
import React from 'react';
import { cn } from '@/lib/utils';
import Header from './Header';
import BottomMenu from './BottomMenu';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideBottomMenu?: boolean;
  showBackButton?: boolean; // Add this new prop
}

const Layout = ({ 
  children, 
  className, 
  hideHeader = false, 
  hideBottomMenu = false,
  showBackButton = false // Add default value for the new prop
}: LayoutProps) => {
  const location = useLocation();
  
  // Generate a unique key for page transitions based on the current route
  const pageKey = location.pathname;
  
  // Hide bottom menu on login page
  const shouldShowBottomMenu = !hideBottomMenu && location.pathname !== '/login';
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideHeader && <Header showBackButton={showBackButton} />}
      <main 
        className={cn(
          "flex-1 flex flex-col w-full max-w-screen-md mx-auto px-4 py-4 animate-fade-in",
          shouldShowBottomMenu && "pb-20", // Add padding at the bottom when menu is visible
          className
        )}
      >
        <div key={pageKey} className="animate-slide-in-up">
          {children}
        </div>
      </main>
      {shouldShowBottomMenu && <BottomMenu />}
    </div>
  );
};

export default Layout;
