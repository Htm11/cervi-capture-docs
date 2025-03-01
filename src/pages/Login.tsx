
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await login(email, password);
    
    if (success) {
      navigate('/patient-registration');
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
            <p className="text-cervi-800 text-lg font-medium">Log in to start screening patients</p>
          </div>

          <div className="glass bg-white/90 p-8 rounded-xl shadow-lg border border-cervi-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cervi-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cervi-800">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.password ? 'border-destructive' : ''}`}
                />
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
                  'Log in'
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-cervi-700 mt-6">
            By logging in, you agree to the terms of service and privacy policy.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
