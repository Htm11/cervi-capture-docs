
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { LogIn, Camera, User } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to patient registration
    if (isAuthenticated) {
      navigate('/patient-registration');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout hideHeader hideBottomMenu>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-cervi-50 to-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-cervi-500 flex items-center justify-center shadow-lg mb-6">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-cervi-800 mb-2">Cervi Scanner</h1>
            <p className="text-muted-foreground">
              Mobile screening tool for healthcare professionals
            </p>
          </div>

          <div className="glass p-8 rounded-xl shadow-sm mb-8">
            <div className="space-y-2 mb-6 text-left">
              <h2 className="font-medium">Features:</h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-cervi-500 mr-2"></div>
                  <span className="text-sm">Secure doctor login</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-cervi-500 mr-2"></div>
                  <span className="text-sm">Comprehensive patient registration</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-cervi-500 mr-2"></div>
                  <span className="text-sm">Image capture with quality analysis</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-cervi-500 mr-2"></div>
                  <span className="text-sm">Immediate feedback system</span>
                </li>
              </ul>
            </div>

            <Button 
              className="w-full bg-cervi-500 hover:bg-cervi-600 text-white" 
              onClick={() => navigate('/login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login to Start
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            A secure mobile web app for healthcare professionals. <br/>
            Log in to begin patient screening.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
