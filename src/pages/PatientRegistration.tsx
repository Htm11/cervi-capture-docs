import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import FormField from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Camera, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Stepper, { Step } from '@/components/Stepper';
import { createPatient } from '@/services/patientService';
import { Patient } from '@/types/patient';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFormData {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: Date | undefined;
  sociodemographicData: string;
  reproductiveHistory: string;
  medicalHistory: string;
  lifestyleFactors: string;
  symptoms: string;
  lastVisaExamResults: string;
  
  education: string;
  occupation: string;
  maritalStatus: string;
  smokingStatus: string;
  alcoholUse: string;
  physicalActivity: string;
  existingConditions: string[];
  commonSymptoms: string[];
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

const educationLevels = [
  "None", "Primary", "Secondary", "Tertiary", "University", "Postgraduate"
];

const maritalStatusOptions = [
  "Single", "Married", "Divorced", "Widowed", "Separated", "Partnered"
];

const medicalConditions = [
  "None", "Diabetes", "Hypertension", "Heart disease", "Asthma", "Cancer", 
  "Thyroid disorder", "Kidney disease", "Liver disease", "Autoimmune disease",
  "HIV/AIDS", "Hepatitis", "STI", "Mental health condition"
];

const symptomsList = [
  "None", "Abnormal bleeding", "Pelvic pain", "Unusual discharge",
  "Pain during intercourse", "Post-coital bleeding", "Lower back pain",
  "Urinary problems", "Itching/burning", "Weight loss", "Fatigue"
];

const physicalActivityOptions = [
  "None", "Light (1-2 days/week)", "Moderate (3-4 days/week)", 
  "Active (5+ days/week)", "Very active"
];

const PatientRegistration = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [patientFormData, setPatientFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    countryCode: '+250',
    phoneNumber: '',
    dateOfBirth: undefined,
    sociodemographicData: '',
    reproductiveHistory: '',
    medicalHistory: '',
    lifestyleFactors: '',
    symptoms: '',
    lastVisaExamResults: '',
    
    education: '',
    occupation: '',
    maritalStatus: '',
    smokingStatus: 'No',
    alcoholUse: 'No',
    physicalActivity: '',
    existingConditions: [],
    commonSymptoms: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmVerified, setConfirmVerified] = useState(false);
  const [confirmInformed, setConfirmInformed] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPatientFormData(prev => ({ ...prev, [id]: value }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setPatientFormData(prev => ({ ...prev, dateOfBirth: date }));
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
    
    if (date) {
      setSelectedYear(date.getFullYear());
      setShowYearPicker(false);
    }
  };
  
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    
    if (patientFormData.dateOfBirth) {
      const newDate = new Date(patientFormData.dateOfBirth);
      newDate.setFullYear(year);
      handleDateChange(newDate);
    } else {
      const newDate = new Date(year, 0, 1);
      handleDateChange(newDate);
    }
    
    setShowYearPicker(false);
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setPatientFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleConditionChange = (condition: string, checked: boolean) => {
    setPatientFormData(prev => {
      let updatedConditions = [...prev.existingConditions];
      
      if (condition === "None" && checked) {
        updatedConditions = ["None"];
      } else if (checked) {
        updatedConditions = updatedConditions.filter(c => c !== "None");
        updatedConditions.push(condition);
      } else {
        updatedConditions = updatedConditions.filter(c => c !== condition);
      }
      
      return { ...prev, existingConditions: updatedConditions };
    });
  };
  
  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setPatientFormData(prev => {
      let updatedSymptoms = [...prev.commonSymptoms];
      
      if (symptom === "None" && checked) {
        updatedSymptoms = ["None"];
      } else if (checked) {
        updatedSymptoms = updatedSymptoms.filter(s => s !== "None");
        updatedSymptoms.push(symptom);
      } else {
        updatedSymptoms = updatedSymptoms.filter(s => s !== symptom);
      }
      
      return { ...prev, commonSymptoms: updatedSymptoms };
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      const requiredFields = ['firstName', 'lastName', 'phoneNumber'];
      
      requiredFields.forEach(field => {
        if (!patientFormData[field as keyof PatientFormData]) {
          newErrors[field] = 'This field is required';
        }
      });
      
      if (patientFormData.phoneNumber && !/^\d{7,12}$/.test(patientFormData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number (7-12 digits)';
      }
      
      if (!patientFormData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
    } else if (step === 2) {
      if (!confirmVerified) {
        newErrors.confirmVerified = 'Please confirm that all information has been verified';
      }
      
      if (!confirmInformed) {
        newErrors.confirmInformed = 'Please confirm that the patient has been informed about the procedure';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        if (!currentDoctor) {
          toast({
            title: "Authentication error",
            description: "Please log in again to continue",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        setIsSubmitting(true);
        
        try {
          const patientToCreate: Patient = {
            firstName: patientFormData.firstName,
            lastName: patientFormData.lastName,
            phoneNumber: `${patientFormData.countryCode}${patientFormData.phoneNumber}`,
            dateOfBirth: patientFormData.dateOfBirth ? patientFormData.dateOfBirth.toISOString() : undefined,
            education: patientFormData.education,
            occupation: patientFormData.occupation,
            maritalStatus: patientFormData.maritalStatus,
            smokingStatus: patientFormData.smokingStatus,
            alcoholUse: patientFormData.alcoholUse,
            physicalActivity: patientFormData.physicalActivity,
            existingConditions: patientFormData.existingConditions,
            commonSymptoms: patientFormData.commonSymptoms,
            reproductiveHistory: patientFormData.reproductiveHistory,
            lastVisaExamResults: patientFormData.lastVisaExamResults,
            screeningStep: 'before-acetic',
            doctor_id: currentDoctor.id
          };
          
          console.log("Creating patient with data:", patientToCreate);
          
          const { data: newPatient, error } = await createPatient(patientToCreate);
          
          if (error || !newPatient) {
            console.error("Error creating patient:", error);
            throw new Error(error?.message || 'Failed to create patient');
          }
          
          console.log("Patient created successfully:", newPatient);
          
          localStorage.setItem('currentPatient', JSON.stringify({
            ...newPatient,
            sociodemographicData: `Education: ${patientFormData.education}, Occupation: ${patientFormData.occupation}, Marital Status: ${patientFormData.maritalStatus}`,
            medicalHistory: `Existing Conditions: ${patientFormData.existingConditions.join(', ')}`,
            lifestyleFactors: `Smoking: ${patientFormData.smokingStatus}, Alcohol: ${patientFormData.alcoholUse}, Physical Activity: ${patientFormData.physicalActivity}`,
            symptoms: patientFormData.commonSymptoms.join(', ')
          }));
          
          navigate('/camera');
        } catch (error) {
          console.error('Error saving patient:', error);
          toast({
            title: "Failed to save patient",
            description: error.message || "There was an error saving the patient data",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
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
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

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
                  value={patientFormData.firstName}
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
                  value={patientFormData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md font-medium text-sm">
                    +250
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
                    placeholder="e.g. 78123456"
                    value={patientFormData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
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
                        !patientFormData.dateOfBirth && "text-muted-foreground",
                        errors.dateOfBirth && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {patientFormData.dateOfBirth ? (
                        format(patientFormData.dateOfBirth, "MMMM d, yyyy")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 flex justify-between items-center border-b">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowYearPicker(!showYearPicker)}
                        className="text-xs font-medium"
                      >
                        {showYearPicker ? "Select Month & Day" : "Select Year First"}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    
                    {showYearPicker ? (
                      <div className="p-2 h-[260px] overflow-y-auto grid grid-cols-4 gap-2">
                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <Button
                            key={year}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleYearSelect(year)}
                            className={cn(
                              "text-sm",
                              selectedYear === year ? "bg-primary text-primary-foreground" : ""
                            )}
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Calendar
                        mode="single"
                        selected={patientFormData.dateOfBirth}
                        onSelect={handleDateChange}
                        initialFocus
                        defaultMonth={patientFormData.dateOfBirth || new Date(selectedYear || new Date().getFullYear(), 0)}
                        disabled={(date) => date > new Date()}
                      />
                    )}
                  </PopoverContent>
                </Popover>
                {errors.dateOfBirth && <p className="text-destructive text-xs">{errors.dateOfBirth}</p>}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Sociodemographic Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select 
                    value={patientFormData.education} 
                    onValueChange={(value) => handleSelectChange('education', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <input
                    id="occupation"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter occupation"
                    value={patientFormData.occupation}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select 
                    value={patientFormData.maritalStatus} 
                    onValueChange={(value) => handleSelectChange('maritalStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
        );
      case 2:
        return (
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Medical Information</h2>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Existing Medical Conditions</h3>
              <p className="text-sm text-muted-foreground mb-3">Select all that apply:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {medicalConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`condition-${condition}`} 
                      checked={patientFormData.existingConditions.includes(condition)}
                      onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`condition-${condition}`}
                      className="text-sm cursor-pointer"
                    >
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Current Symptoms</h3>
              <p className="text-sm text-muted-foreground mb-3">Select all that apply:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {symptomsList.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`symptom-${symptom}`} 
                      checked={patientFormData.commonSymptoms.includes(symptom)}
                      onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`symptom-${symptom}`}
                      className="text-sm cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Lifestyle Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm">Smoking Status</Label>
                  <RadioGroup
                    value={patientFormData.smokingStatus}
                    onValueChange={(value) => handleSelectChange('smokingStatus', value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="smoking-no" />
                      <Label htmlFor="smoking-no" className="text-sm cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="smoking-yes" />
                      <Label htmlFor="smoking-yes" className="text-sm cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Former" id="smoking-former" />
                      <Label htmlFor="smoking-former" className="text-sm cursor-pointer">Former</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm">Alcohol Use</Label>
                  <RadioGroup
                    value={patientFormData.alcoholUse}
                    onValueChange={(value) => handleSelectChange('alcoholUse', value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="alcohol-no" />
                      <Label htmlFor="alcohol-no" className="text-sm cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Occasional" id="alcohol-occasional" />
                      <Label htmlFor="alcohol-occasional" className="text-sm cursor-pointer">Occasional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Regular" id="alcohol-regular" />
                      <Label htmlFor="alcohol-regular" className="text-sm cursor-pointer">Regular</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="physicalActivity">Physical Activity</Label>
                  <Select 
                    value={patientFormData.physicalActivity} 
                    onValueChange={(value) => handleSelectChange('physicalActivity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {physicalActivityOptions.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <FormField
                id="reproductiveHistory"
                label="Reproductive History"
                multiline
                placeholder="Enter details about pregnancies, births, contraceptive use, etc."
                value={patientFormData.reproductiveHistory}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <FormField
                id="lastVisaExamResults"
                label="Last Visa Exam Results"
                multiline
                placeholder="Enter results from the last visa exam"
                value={patientFormData.lastVisaExamResults}
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
                    className="text-sm font-medium cursor-pointer"
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
                    className="text-sm font-medium cursor-pointer"
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
      <div className="pb-24">
        <Stepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
          className="mb-6"
        />
        
        <form className="space-y-8">
          {renderStepContent()}
        </form>
        
        <div className="fixed bottom-[68px] left-0 right-0 py-3 px-4 bg-white border-t border-border shadow-sm z-20">
          <div className="max-w-screen-md mx-auto flex space-x-3">
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
        </div>
      </div>
    </Layout>
  );
};

export default PatientRegistration;
