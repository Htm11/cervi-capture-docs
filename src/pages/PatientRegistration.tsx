import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import FormField from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Loader2, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PatientData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: Date | undefined;
  sociodemographicData: string;
  reproductiveHistory: string;
  medicalHistory: string;
  lifestyleFactors: string;
  symptoms: string;
  lastVisaExamResults: string;
}

interface FormErrors {
  [key: string]: string;
}

const PatientRegistration = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patientData, setPatientData] = useState<PatientData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: undefined,
    sociodemographicData: '',
    reproductiveHistory: '',
    medicalHistory: '',
    lifestyleFactors: '',
    symptoms: '',
    lastVisaExamResults: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmVerified, setConfirmVerified] = useState(false);
  const [confirmInformed, setConfirmInformed] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPatientData(prev => ({ ...prev, [id]: value }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setPatientData(prev => ({ ...prev, dateOfBirth: date }));
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const requiredFields = ['firstName', 'lastName', 'phoneNumber'];
    
    requiredFields.forEach(field => {
      if (!patientData[field as keyof PatientData]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    if (patientData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(patientData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!patientData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!confirmVerified) {
      newErrors.confirmVerified = 'You must confirm that patient information is verified';
    }
    
    if (!confirmInformed) {
      newErrors.confirmInformed = 'You must confirm that the patient has been informed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Form validation failed",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      localStorage.setItem('currentPatient', JSON.stringify(patientData));
      
      setIsSubmitting(false);
      toast({
        title: "Patient registered successfully",
        description: "Proceeding to image capture",
      });
      
      navigate('/camera');
    }, 1500);
  };

  return (
    <Layout>
      <div className="pb-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="firstName"
                label="First Name"
                placeholder="Enter first name"
                required
                value={patientData.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              
              <FormField
                id="lastName"
                label="Last Name"
                placeholder="Enter last name"
                required
                value={patientData.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />
              
              <FormField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="e.g. +1234567890"
                required
                value={patientData.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
              />
              
              <div className="space-y-2">
                <Label 
                  htmlFor="dateOfBirth" 
                  className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-destructive"
                >
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dateOfBirth"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !patientData.dateOfBirth && "text-muted-foreground",
                        errors.dateOfBirth && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {patientData.dateOfBirth ? (
                        format(patientData.dateOfBirth, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={patientData.dateOfBirth}
                      onSelect={handleDateChange}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateOfBirth && <p className="text-destructive text-xs">{errors.dateOfBirth}</p>}
              </div>
            </div>
          </section>
          
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Medical Information</h2>
            <div className="space-y-4">
              <FormField
                id="sociodemographicData"
                label="Sociodemographic Data"
                multiline
                placeholder="Enter sociodemographic information"
                value={patientData.sociodemographicData}
                onChange={handleChange}
              />
              
              <FormField
                id="reproductiveHistory"
                label="Reproductive History"
                multiline
                placeholder="Enter reproductive history"
                value={patientData.reproductiveHistory}
                onChange={handleChange}
              />
              
              <FormField
                id="medicalHistory"
                label="Medical History"
                multiline
                placeholder="Enter medical history"
                value={patientData.medicalHistory}
                onChange={handleChange}
              />
              
              <FormField
                id="lifestyleFactors"
                label="Lifestyle Factors"
                multiline
                placeholder="Enter lifestyle factors"
                value={patientData.lifestyleFactors}
                onChange={handleChange}
              />
              
              <FormField
                id="symptoms"
                label="Symptoms (if any)"
                multiline
                placeholder="Enter symptoms"
                value={patientData.symptoms}
                onChange={handleChange}
              />
              
              <FormField
                id="lastVisaExamResults"
                label="Last Visa Exam Results"
                multiline
                placeholder="Enter results from the last visa exam"
                value={patientData.lastVisaExamResults}
                onChange={handleChange}
              />
            </div>
          </section>
          
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Confirmations</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="confirmVerified" 
                  checked={confirmVerified} 
                  onCheckedChange={(checked) => {
                    setConfirmVerified(checked as boolean);
                    if (checked && errors.confirmVerified) {
                      setErrors(prev => ({ ...prev, confirmVerified: '' }));
                    }
                  }}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="confirmVerified" 
                    className="text-sm font-medium"
                  >
                    I confirm that all patient information has been verified
                  </Label>
                  {errors.confirmVerified && <p className="text-destructive text-xs">{errors.confirmVerified}</p>}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="confirmInformed" 
                  checked={confirmInformed} 
                  onCheckedChange={(checked) => {
                    setConfirmInformed(checked as boolean);
                    if (checked && errors.confirmInformed) {
                      setErrors(prev => ({ ...prev, confirmInformed: '' }));
                    }
                  }}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="confirmInformed" 
                    className="text-sm font-medium"
                  >
                    I confirm that the patient has been informed about the procedure
                  </Label>
                  {errors.confirmInformed && <p className="text-destructive text-xs">{errors.confirmInformed}</p>}
                </div>
              </div>
            </div>
          </section>
          
          <div className="py-4">
            <Button 
              type="submit" 
              className="w-full bg-cervi-500 hover:bg-cervi-600 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering patient...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Proceed to Image Capture
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PatientRegistration;
