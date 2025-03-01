
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import FormField from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Stepper, { Step } from '@/components/Stepper';

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

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Medical Info" },
  { id: 3, label: "Before Acetic" },
  { id: 4, label: "After Acetic" },
];

const PatientRegistration = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      // Validate basic information
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
    } else if (step === 2) {
      // Medical information step - this could be optional
      // or you could add validation for specific fields
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Save patient data before proceeding to camera step
        localStorage.setItem('currentPatient', JSON.stringify({
          ...patientData,
          screeningStep: 'before-acetic'
        }));
        navigate('/camera');
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast({
        title: "Please fix the errors",
        description: "There are validation errors in the form",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    // Only allow navigating to completed steps
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter first name"
                  value={patientData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter last name"
                  value={patientData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. +1234567890"
                  value={patientData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <p className="text-destructive text-xs">{errors.phoneNumber}</p>}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="dateOfBirth" 
                  className="text-sm font-medium"
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
        );
      case 2:
        return (
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
            
            <div className="mt-6 space-y-4">
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
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="pb-16">
        <Stepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
          className="mb-6"
        />
        
        <form className="space-y-8">
          {renderStepContent()}
          
          <div className="py-4 flex space-x-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            <Button 
              type="button"
              className="flex-1 bg-cervi-500 hover:bg-cervi-600 text-white" 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 2 ? (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Proceed to Camera
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
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
