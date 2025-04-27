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
import { Loader2, Camera, ArrowLeft, ArrowRight, ChevronDown, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Stepper, { Step } from '@/components/Stepper';
import { createPatient } from '@/services/patientService'; 
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pregnancyOptions = [
  "0", "1–2", "3–4", "5+"
];

const parityOptions = [
  "0", "1–2", "3–4", "5+"
];

const menstrualStatusOptions = [
  "Regular", "Irregular", "Postmenopausal"
];

const sexualActivityAgeOptions = [
  "<16", "16–18", ">18"
];

const contraceptiveOptions = [
  "None", "Oral pills", "IUD", "Other"
];

const previousScreeningOptions = [
  "Never", ">5 years ago", "<5 years ago"
];

const screeningResultOptions = [
  "NA", "Normal", "Abnormal", "Unknown"
];

interface PatientData {
  unique_id: string;
  dateOfBirth: Date | undefined;
  sociodemographicData: string;
  reproductiveHistory: {
    pregnancies: string;
    parity: string;
    menstrualStatus: string;
    sexualActivityAge: string;
    contraceptiveUse: string;
    otherContraceptive?: string;
  };
  medicalHistory: string;
  lifestyleFactors: string;
  symptoms: string;
  
  education: string;
  occupation: string;
  maritalStatus: string;
  smokingStatus: string;
  alcoholUse: string;
  physicalActivity: string;
  existingConditions: string[];
  commonSymptoms: string[];
  screeningHistory: {
    previousScreening: string;
    screeningResult: string;
  };
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
  "None", "Primary", "Secondary", "Higher Education"
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

const occupationOptions = [
  "Unemployed", "Employed", "Student", "Retired"
];

const smokingStatusOptions = [
  "Never", "Current", "Former"
];

const alcoholUseOptions = [
  "Never", "Occasional", "Regular"
];

const PatientRegistration = () => {
  const { isAuthenticated, currentDoctor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    unique_id: `PT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    dateOfBirth: undefined,
    sociodemographicData: '',
    reproductiveHistory: {
      pregnancies: '',
      parity: '',
      menstrualStatus: '',
      sexualActivityAge: '',
      contraceptiveUse: 'None',
      otherContraceptive: ''
    },
    medicalHistory: '',
    lifestyleFactors: '',
    symptoms: '',
    
    education: '',
    occupation: '',
    maritalStatus: '',
    smokingStatus: 'Never',
    alcoholUse: 'Never',
    physicalActivity: '',
    existingConditions: [],
    commonSymptoms: [],
    screeningHistory: {
      previousScreening: '',
      screeningResult: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmVerified, setConfirmVerified] = useState(false);
  const [confirmInformed, setConfirmInformed] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [patientCreated, setPatientCreated] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

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
    
    if (date) {
      setSelectedYear(date.getFullYear());
      setShowYearPicker(false);
    }
  };
  
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    
    if (patientData.dateOfBirth) {
      const newDate = new Date(patientData.dateOfBirth);
      newDate.setFullYear(year);
      handleDateChange(newDate);
    } else {
      const newDate = new Date(year, 0, 1);
      handleDateChange(newDate);
    }
    
    setShowYearPicker(false);
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleConditionChange = (condition: string, checked: boolean) => {
    setPatientData(prev => {
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
    setPatientData(prev => {
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
      if (!patientData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePatient = async () => {
    if (!currentDoctor?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a patient.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSubmitting(true);
      
      const medicalHistoryJSON = {
        sociodemographic: {
          education: patientData.education,
          occupation: patientData.occupation,
          maritalStatus: patientData.maritalStatus
        },
        lifestyle: {
          smoking: patientData.smokingStatus,
          alcohol: patientData.alcoholUse,
          physicalActivity: patientData.physicalActivity
        },
        medical: {
          conditions: patientData.existingConditions,
          symptoms: patientData.commonSymptoms,
          reproductiveHistory: patientData.reproductiveHistory,
          
        }
      };
      
      console.log('Medical history being saved:', JSON.stringify(medicalHistoryJSON, null, 2));
      console.log('Medical conditions:', patientData.existingConditions);
      console.log('Symptoms:', patientData.commonSymptoms);
      
      const newPatient = {
        doctor_id: currentDoctor.id,
        unique_id: patientData.unique_id,
        date_of_birth: patientData.dateOfBirth ? format(patientData.dateOfBirth, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
        medical_history: medicalHistoryJSON
      };
      
      const createdPatient = await createPatient(newPatient);
      
      if (createdPatient && createdPatient.id) {
        setPatientCreated(true);
        setCreatedPatientId(createdPatient.id);
        return createdPatient.id;
      } else {
        throw new Error('Failed to create patient');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error creating patient",
        description: "Could not save patient information. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        const patientId = await handleCreatePatient();
        if (!patientId) {
          return; // Don't proceed if patient creation failed
        }
        
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const medicalHistoryJSON = {
          sociodemographic: {
            education: patientData.education,
            occupation: patientData.occupation,
            maritalStatus: patientData.maritalStatus
          },
          lifestyle: {
            smoking: patientData.smokingStatus,
            alcohol: patientData.alcoholUse,
            physicalActivity: patientData.physicalActivity
          },
          medical: {
            conditions: patientData.existingConditions,
            symptoms: patientData.commonSymptoms,
            reproductiveHistory: patientData.reproductiveHistory,
            
          }
        };
        
        const storageData = {
          ...patientData,
          id: createdPatientId,
          screeningStep: 'before-acetic',
          medicalHistory: medicalHistoryJSON
        };
        
        localStorage.setItem('currentPatient', JSON.stringify(storageData));
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
                <Label>Patient ID</Label>
                <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                  <span className="text-gray-600">{patientData.unique_id}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically generated unique identifier
                </p>
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
                        format(patientData.dateOfBirth, "MMMM d, yyyy")
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
                        selected={patientData.dateOfBirth}
                        onSelect={handleDateChange}
                        initialFocus
                        defaultMonth={patientData.dateOfBirth || new Date(selectedYear || new Date().getFullYear(), 0)}
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
                    value={patientData.education} 
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
                  <Select 
                    value={patientData.occupation} 
                    onValueChange={(value) => handleSelectChange('occupation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupationOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select 
                    value={patientData.maritalStatus} 
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
                      checked={patientData.existingConditions.includes(condition)}
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
                      checked={patientData.commonSymptoms.includes(symptom)}
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
              <h3 className="text-md font-medium mb-4">Reproductive History</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm">Number of pregnancies</Label>
                  <RadioGroup
                    value={patientData.reproductiveHistory.pregnancies}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      reproductiveHistory: {
                        ...prev.reproductiveHistory,
                        pregnancies: value
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {pregnancyOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`pregnancy-${option}`} />
                        <Label 
                          htmlFor={`pregnancy-${option}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Parity (live births)</Label>
                  <RadioGroup
                    value={patientData.reproductiveHistory.parity}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      reproductiveHistory: {
                        ...prev.reproductiveHistory,
                        parity: value
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {parityOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`parity-${option}`} />
                        <Label 
                          htmlFor={`parity-${option}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Menstrual Status</Label>
                  <RadioGroup
                    value={patientData.reproductiveHistory.menstrualStatus}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      reproductiveHistory: {
                        ...prev.reproductiveHistory,
                        menstrualStatus: value
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {menstrualStatusOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`menstrual-${option.toLowerCase()}`} />
                        <Label 
                          htmlFor={`menstrual-${option.toLowerCase()}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Age at first sexual activity</Label>
                  <RadioGroup
                    value={patientData.reproductiveHistory.sexualActivityAge}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      reproductiveHistory: {
                        ...prev.reproductiveHistory,
                        sexualActivityAge: value
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {sexualActivityAgeOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`sexual-age-${option}`} />
                        <Label 
                          htmlFor={`sexual-age-${option}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Contraceptive use</Label>
                  <RadioGroup
                    value={patientData.reproductiveHistory.contraceptiveUse}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      reproductiveHistory: {
                        ...prev.reproductiveHistory,
                        contraceptiveUse: value,
                        ...(value !== 'Other' && { otherContraceptive: '' })
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {contraceptiveOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`contraceptive-${option.toLowerCase()}`} />
                        <Label 
                          htmlFor={`contraceptive-${option.toLowerCase()}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {patientData.reproductiveHistory.contraceptiveUse === 'Other' && (
                    <div className="mt-2">
                      <FormField
                        id="otherContraceptive"
                        label="Specify other contraceptive"
                        placeholder="Enter contraceptive method"
                        value={patientData.reproductiveHistory.otherContraceptive}
                        onChange={(e) => setPatientData(prev => ({
                          ...prev,
                          reproductiveHistory: {
                            ...prev.reproductiveHistory,
                            otherContraceptive: e.target.value
                          }
                        }))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Lifestyle Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm">Smoking Status</Label>
                  <RadioGroup
                    value={patientData.smokingStatus}
                    onValueChange={(value) => handleSelectChange('smokingStatus', value)}
                    className="flex flex-col space-y-1"
                  >
                    {smokingStatusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <RadioGroupItem value={status} id={`smoking-${status.toLowerCase()}`} />
                        <Label 
                          htmlFor={`smoking-${status.toLowerCase()}`} 
                          className="text-sm cursor-pointer"
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm">Alcohol Use</Label>
                  <RadioGroup
                    value={patientData.alcoholUse}
                    onValueChange={(value) => handleSelectChange('alcoholUse', value)}
                    className="flex flex-col space-y-1"
                  >
                    {alcoholUseOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <RadioGroupItem value={status} id={`alcohol-${status.toLowerCase()}`} />
                        <Label 
                          htmlFor={`alcohol-${status.toLowerCase()}`} 
                          className="text-sm cursor-pointer"
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="physicalActivity">Physical Activity</Label>
                  <Select 
                    value={patientData.physicalActivity} 
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
              <h3 className="text-md font-medium mb-4">Screening History</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm">Previous cervical cancer screening</Label>
                  <RadioGroup
                    value={patientData.screeningHistory.previousScreening}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      screeningHistory: {
                        ...prev.screeningHistory,
                        previousScreening: value
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {previousScreeningOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`screening-${option}`} />
                        <Label 
                          htmlFor={`screening-${option}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Result (if known)</Label>
                  <RadioGroup
                    value={patientData.screeningHistory.screeningResult}
                    onValueChange={(value) => setPatientData(prev => ({
                      ...prev,
                      screeningHistory: {
                        ...prev.screeningHistory,
                        screeningResult: value
                      }
                    }))}
                    className="flex space-x-4"
                  >
                    {screeningResultOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`result-${option}`} />
                        <Label 
                          htmlFor={`result-${option}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
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
