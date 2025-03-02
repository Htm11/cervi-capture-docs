
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Lock, Info } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { hasValidSupabaseCredentials } from '@/lib/supabase';

const Login = () => {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  
  // Signup form state
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
  
  // Development mode indicator
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  
  const { login, signUp, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we're in development mode
    setIsDevelopmentMode(!hasValidSupabaseCredentials());
    
    // If already authenticated, redirect to patient registration
    if (isAuthenticated) {
      navigate('/patient-registration');
    }
  }, [isAuthenticated, navigate]);

  const validateLoginForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;
    
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }
    
    setLoginErrors(errors);
    return isValid;
  };

  const validateSignupForm = () => {
    const errors = { name: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;
    
    if (!name) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!signupEmail) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!signupPassword) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (signupPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setSignupErrors(errors);
    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    const success = await login(email, password);
    
    if (success) {
      navigate('/patient-registration');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }
    
    const success = await signUp(signupEmail, signupPassword, name);
    
    if (success) {
      // Clear the form and switch to login tab
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');
      setName('');
      
      // Auto-fill the login form with signup details
      setEmail(signupEmail);
      setPassword(signupPassword);
      
      // Switch to login tab
      document.getElementById('login-tab')?.click();
    }
  };

  return (
    <Layout hideHeader className="bg-gradient-to-b from-cervi-50 via-cervi-100 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/77cb8974-0f23-401c-a300-d69d6f0523ce.png" 
              alt="Cervi Scanner Logo" 
              className="h-24 mx-auto mb-4"
            />
            <p className="text-cervi-800 text-lg font-medium">Welcome to Cervi Scanner</p>
          </div>

          {isDevelopmentMode && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Development Mode</p>
                <p>Supabase credentials not detected. Using mock authentication. Any email/password will work.</p>
              </div>
            </div>
          )}

          <div className="glass bg-white/90 p-6 rounded-xl shadow-lg border border-cervi-200">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger id="login-tab" value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-cervi-800">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 pl-10 ${loginErrors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {loginErrors.email && <p className="text-destructive text-xs">{loginErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-cervi-800">Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 pl-10 ${loginErrors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
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
              
              <TabsContent value="signup">
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cervi-800">Full Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Dr. Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 pl-10 ${signupErrors.name ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.name && <p className="text-destructive text-xs">{signupErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-cervi-800">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="doctor@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 pl-10 ${signupErrors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.email && <p className="text-destructive text-xs">{signupErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-cervi-800">Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 pl-10 ${signupErrors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signupErrors.password && <p className="text-destructive text-xs">{signupErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-cervi-800">Confirm Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 pl-10 ${signupErrors.confirmPassword ? 'border-destructive' : ''}`}
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
                      'Create Account'
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
