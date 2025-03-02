
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [signupErrors, setSignupErrors] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateLoginForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;
    
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const validateSignupForm = () => {
    const newErrors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;
    
    if (!name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!signupEmail) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!signupPassword) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (signupPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (confirmPassword !== signupPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setSignupErrors(newErrors);
    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateLoginForm()) {
      const success = await login(email, password);
      
      if (success) {
        navigate('/patient-registration');
      }
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateSignupForm()) {
      const success = await signup(signupEmail, signupPassword, name);
      
      if (success) {
        // For now, stay on the login page and let the user log in
        // Clear the signup form
        setSignupEmail('');
        setSignupPassword('');
        setConfirmPassword('');
        setName('');
      }
    }
  };

  return (
    <Layout hideHeader className="bg-gradient-to-b from-cervi-50 via-cervi-100 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/77cb8974-0f23-401c-a300-d69d6f0523ce.png" 
              alt="Cervi Scanner Logo" 
              className="h-24 mx-auto mb-4"
            />
            <p className="text-cervi-800 text-lg font-medium">Access your CerviScanner account</p>
          </div>

          <div className="glass bg-white/90 p-8 rounded-xl shadow-lg border border-cervi-200">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-cervi-800">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-cervi-800">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
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
                      <>
                        Log in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cervi-800">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Dr. Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`pl-10 bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${signupErrors.name ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.name && <p className="text-destructive text-xs">{signupErrors.name}</p>}
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-cervi-800">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="doctor@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className={`pl-10 bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${signupErrors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.email && <p className="text-destructive text-xs">{signupErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-cervi-800">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`pl-10 bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${signupErrors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.password && <p className="text-destructive text-xs">{signupErrors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-cervi-800">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${signupErrors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.confirmPassword && <p className="text-destructive text-xs">{signupErrors.confirmPassword}</p>}
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
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="text-center mt-6 space-y-4">
            <p className="text-sm text-cervi-700">
              By logging in, you agree to the terms of service and privacy policy.
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
