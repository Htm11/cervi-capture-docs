
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const formErrors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;

    if (!name) {
      formErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email) {
      formErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      formErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log("Attempting registration with email:", email, "and name:", name);
    const success = await register(email, password, name);
    
    if (success) {
      console.log("Registration successful, redirecting to patient registration");
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/patient-registration');
      }
    } else {
      console.log("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-cervi-800 flex items-center gap-2">
          <User className="h-4 w-4" />
          Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Dr. Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.name ? 'border-destructive' : ''}`}
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.password ? 'border-destructive' : ''}`}
        />
        {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`bg-white/80 border-cervi-200 focus-visible:ring-cervi-300 ${errors.confirmPassword ? 'border-destructive' : ''}`}
        />
        {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
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
  );
};

export default RegisterForm;
