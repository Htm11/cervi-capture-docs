
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthFooter from '@/components/auth/AuthFooter';

const Login = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && currentDoctor) {
      console.log("User already authenticated, redirecting to patient registration");
      navigate('/patient-registration');
    }
  }, [isAuthenticated, currentDoctor, navigate]);

  const handleAuthSuccess = () => {
    navigate('/patient-registration');
  };

  return (
    <Layout hideHeader className="bg-gradient-to-b from-cervi-50 via-cervi-100 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <AuthHeader activeTab={activeTab} />

          <div className="glass bg-white/90 p-8 rounded-xl shadow-lg border border-cervi-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm onSuccess={handleAuthSuccess} />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm onSuccess={handleAuthSuccess} />
              </TabsContent>
            </Tabs>
          </div>

          <AuthFooter />
        </div>
      </div>
    </Layout>
  );
};

export default Login;
