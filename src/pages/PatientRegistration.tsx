
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import FormField from '@/components/FormField';
import { CheckCircle, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Stepper, { Step } from '@/components/Stepper';
import { createPatient } from '@/services/patientService';

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Medical Info" },
  { id: 3, label: "Before Acetic" },
  { id: 4, label: "After Acetic" },
];

const PatientRegistration = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Basic patient info form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Medical history form state
  const [medicalHistory, setMedicalHistory] = useState('');
  const [isAnemic, setIsAnemic] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHIV, setHasHIV] = useState(false);
  
  // Form step state
  const [step, setStep] = useState(1);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Create the patient in the database first
      if (!currentDoctor) {
        throw new Error('Doctor information not available');
      }
      
      const patientData = {
        doctor_id: currentDoctor.id,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        contact_number: phoneNumber,
        medical_history: getMedicalHistoryText()
      };
      
      const createdPatient = await createPatient(patientData);
      
      if (!createdPatient) {
        throw new Error('Failed to create patient record');
      }
      
      // Save the patient data to local storage for the screening session
      const patientSession = {
        id: createdPatient.id,
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        medicalHistory: getMedicalHistoryText(),
        screeningStep: 'before-acetic'
      };
      
      localStorage.setItem('currentPatient', JSON.stringify(patientSession));
      
      // Success message
      toast({
        title: "Patient registered",
        description: `${firstName} ${lastName} has been registered successfully.`,
      });
      
      // Navigate to camera page for imaging
      navigate('/camera');
    } catch (error) {
      console.error('Error registering patient:', error);
      toast({
        title: "Registration failed",
        description: "There was an error registering the patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get formatted medical history text
  const getMedicalHistoryText = () => {
    let history = medicalHistory.trim();
    
    // Add medical conditions
    const conditions = [];
    if (isAnemic) conditions.push('Anemia');
    if (hasDiabetes) conditions.push('Diabetes');
    if (hasHIV) conditions.push('HIV');
    
    if (conditions.length > 0) {
      if (history) history += '\n\n';
      history += `Medical Conditions: ${conditions.join(', ')}`;
    }
    
    return history;
  };
  
  // Handle navigation to next step
  const handleNext = () => {
    // Validate required fields for step 1
    if (step === 1) {
      const newErrors: Record<string, string> = {};
      
      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
      
      // If there are errors, don't proceed
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Clear any existing errors
      setErrors({});
    }
    
    setStep(step + 1);
  };
  
  // Handle navigation to previous step
  const handleBack = () => {
    setStep(step - 1);
  };
  
  // Render the appropriate form step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              id="firstName"
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
            />
            
            <FormField
              id="lastName"
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
            />
            
            <FormField
              id="dateOfBirth"
              label="Date of Birth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              error={errors.dateOfBirth}
            />
            
            <FormField
              id="phoneNumber"
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <FormField
              id="medicalHistory"
              label="Medical History"
              multiline
              rows={4}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Enter any relevant medical history..."
            />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Medical Conditions</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAnemic"
                    checked={isAnemic}
                    onChange={(e) => setIsAnemic(e.target.checked)}
                    className="w-4 h-4 rounded text-cervi-500 focus:ring-cervi-500"
                  />
                  <label htmlFor="isAnemic" className="text-sm">Anemia</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasDiabetes"
                    checked={hasDiabetes}
                    onChange={(e) => setHasDiabetes(e.target.checked)}
                    className="w-4 h-4 rounded text-cervi-500 focus:ring-cervi-500"
                  />
                  <label htmlFor="hasDiabetes" className="text-sm">Diabetes</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasHIV"
                    checked={hasHIV}
                    onChange={(e) => setHasHIV(e.target.checked)}
                    className="w-4 h-4 rounded text-cervi-500 focus:ring-cervi-500"
                  />
                  <label htmlFor="hasHIV" className="text-sm">HIV</label>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-4">
          <Stepper steps={steps} currentStep={step} />
          
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <h1 className="text-xl font-semibold mb-4">
              {step === 1 ? "Patient Information" : "Medical History"}
            </h1>
            
            <form onSubmit={handleSubmit}>
              {renderStep()}
            </form>
          </div>
        </div>
        
        <div className="p-4 border-t bg-white mt-auto">
          <div className="flex justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-[45%]"
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="w-[45%]"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            
            {step < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-[45%] bg-cervi-500 hover:bg-cervi-600 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-[45%] bg-cervi-500 hover:bg-cervi-600 text-white"
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Register Patient
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientRegistration;
