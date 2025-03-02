
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormField from '@/components/FormField';

const Login = () => {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  const validateLoginForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!loginEmail) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!loginPassword) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setLoginErrors(errors);
    return isValid;
  };

  const validateRegisterForm = () => {
    const errors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;

    if (!regName) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!regEmail) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(regEmail)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!regPassword) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setRegErrors(errors);
    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    const success = await login(loginEmail, loginPassword);
    
    if (success) {
      navigate('/patient-registration');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    const success = await register(regEmail, regPassword, regName);
    
    if (success) {
      navigate('/patient-registration');
    }
  };

  return (
    <Layout hideHeader className="bg-gradient-to-b from-cervi-50 via-cervi-100 to-white min-h-screen w-full">
      <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/77cb8974-0f23-401c-a300-d69d6f0523ce.png" 
              alt="Cervi Scanner Logo" 
              className="h-24 mx-auto mb-4"
            />
            <p className="text-cervi-800 text-lg font-medium">
              {activeTab === "login" 
                ? "Log in to start screening patients" 
                : "Create a new account to get started"}
            </p>
          </div>

          <div className="glass bg-white/90 p-8 rounded-xl shadow-lg border border-cervi-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-cervi-800 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${loginErrors.email ? 'border-destructive' : ''}`}
                    />
                    {loginErrors.email && <p className="text-destructive text-xs">{loginErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-cervi-800 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${loginErrors.password ? 'border-destructive' : ''}`}
                    />
                    {loginErrors.password && <p className="text-destructive text-xs">{loginErrors.password}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-300 to-cervi-400 hover:from-pink-400 hover:to-cervi-500 text-white font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Log in'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cervi-800 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${regErrors.name ? 'border-destructive' : ''}`}
                    />
                    {regErrors.name && <p className="text-destructive text-xs">{regErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-cervi-800 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="doctor@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${regErrors.email ? 'border-destructive' : ''}`}
                    />
                    {regErrors.email && <p className="text-destructive text-xs">{regErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-cervi-800 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${regErrors.password ? 'border-destructive' : ''}`}
                    />
                    {regErrors.password && <p className="text-destructive text-xs">{regErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-cervi-800 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${regErrors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                    {regErrors.confirmPassword && <p className="text-destructive text-xs">{regErrors.confirmPassword}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-300 to-cervi-400 hover:from-pink-400 hover:to-cervi-500 text-white font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="text-center mt-6 space-y-4">
            <p className="text-sm text-cervi-700">
              By using this application, you agree to the terms of service and privacy policy.
            </p>
            
            <div className="flex flex-col items-center">
              <img 
                src="/lovable-uploads/4587ef05-43cd-4550-9707-d8df5017ab8a.png" 
                alt="MednTech Logo" 
                className="h-5 mb-1" 
              />
              <p className="text-xs text-gray-500">© {new Date().getFullYear()} MednTech. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
