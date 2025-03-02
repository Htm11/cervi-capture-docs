<lov-code>
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientData {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: Date | undefined;
  
  // Updated medical information structure
  sociodemographicData: {
    education: string;
    occupation: string;
    maritalStatus: string;
    livingArrangement: string;
  };
  
  reproductiveHistory: {
    pregnancies: string;
    births: string;
    abortions: string;
    lastMenstrualPeriod: string;
    contraceptiveUse: string;
    contraceptiveType: string;
  };
  
  medicalHistory: {
    existingConditions: string[];
    medications: string;
    allergies: string;
    previousSurgeries: string;
    familyHistory: string[];
  };
  
  lifestyleFactors: {
    smokingStatus: string;
    smokingFrequency: string;
    alcoholUse: string;
    alcoholFrequency: string;
    physicalActivity: string;
    diet: string[];
  };
  
  symptoms: string[];
  lastVisaExamDate: string;
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

// Comprehensive list of country codes for phone numbers
const countryCodes = [
  { code: "+1", country: "United States/Canada" },
  { code: "+7", country: "Russia/Kazakhstan" },
  { code: "+20", country: "Egypt" },
  { code: "+27", country: "South Africa" },
  { code: "+30", country: "Greece" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+33", country: "France" },
  { code: "+34", country: "Spain" },
  { code: "+36", country: "Hungary" },
  { code: "+39", country: "Italy/Vatican City" },
  { code: "+40", country: "Romania" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+44", country: "United Kingdom" },
  { code: "+45", country: "Denmark" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+48", country: "Poland" },
  { code: "+49", country: "Germany" },
  { code: "+51", country: "Peru" },
  { code: "+52", country: "Mexico" },
  { code: "+53", country: "Cuba" },
  { code: "+54", country: "Argentina" },
  { code: "+55", country: "Brazil" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+60", country: "Malaysia" },
  { code: "+61", country: "Australia" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+64", country: "New Zealand" },
  { code: "+65", country: "Singapore" },
  { code: "+66", country: "Thailand" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+84", country: "Vietnam" },
  { code: "+86", country: "China" },
  { code: "+90", country: "Turkey" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+93", country: "Afghanistan" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+95", country: "Myanmar" },
  { code: "+98", country: "Iran" },
  { code: "+212", country: "Morocco" },
  { code: "+213", country: "Algeria" },
  { code: "+216", country: "Tunisia" },
  { code: "+218", country: "Libya" },
  { code: "+220", country: "Gambia" },
  { code: "+221", country: "Senegal" },
  { code: "+222", country: "Mauritania" },
  { code: "+223", country: "Mali" },
  { code: "+224", country: "Guinea" },
  { code: "+225", country: "Côte d'Ivoire" },
  { code: "+226", country: "Burkina Faso" },
  { code: "+227", country: "Niger" },
  { code: "+228", country: "Togo" },
  { code: "+229", country: "Benin" },
  { code: "+230", country: "Mauritius" },
  { code: "+231", country: "Liberia" },
  { code: "+232", country: "Sierra Leone" },
  { code: "+233", country: "Ghana" },
  { code: "+234", country: "Nigeria" },
  { code: "+235", country: "Chad" },
  { code: "+236", country: "Central African Republic" },
  { code: "+237", country: "Cameroon" },
  { code: "+238", country: "Cape Verde" },
  { code: "+239", country: "São Tomé and Príncipe" },
  { code: "+240", country: "Equatorial Guinea" },
  { code: "+241", country: "Gabon" },
  { code: "+242", country: "Republic of the Congo" },
  { code: "+243", country: "Democratic Republic of the Congo" },
  { code: "+244", country: "Angola" },
  { code: "+245", country: "Guinea-Bissau" },
  { code: "+249", country: "Sudan" },
  { code: "+250", country: "Rwanda" },
  { code: "+251", country: "Ethiopia" },
  { code: "+252", country: "Somalia" },
  { code: "+253", country: "Djibouti" },
  { code: "+254", country: "Kenya" },
  { code: "+255", country: "Tanzania" },
  { code: "+256", country: "Uganda" },
  { code: "+257", country: "Burundi" },
  { code: "+258", country: "Mozambique" },
  { code: "+260", country: "Zambia" },
  { code: "+261", country: "Madagascar" },
  { code: "+262", country: "Réunion" },
  { code: "+263", country: "Zimbabwe" },
  { code: "+264", country: "Namibia" },
  { code: "+265", country: "Malawi" },
  { code: "+266", country: "Lesotho" },
  { code: "+267", country: "Botswana" },
  { code: "+268", country: "Eswatini" },
  { code: "+269", country: "Comoros" },
  { code: "+351", country: "Portugal" },
  { code: "+352", country: "Luxembourg" },
  { code: "+353", country: "Ireland" },
  { code: "+354", country: "Iceland" },
  { code: "+355", country: "Albania" },
  { code: "+356", country: "Malta" },
  { code: "+357", country: "Cyprus" },
  { code: "+358", country: "Finland" },
  { code: "+359", country: "Bulgaria" },
  { code: "+370", country: "Lithuania" },
  { code: "+371", country: "Latvia" },
  { code: "+372", country: "Estonia" },
  { code: "+373", country: "Moldova" },
  { code: "+374", country: "Armenia" },
  { code: "+375", country: "Belarus" },
  { code: "+376", country: "Andorra" },
  { code: "+380", country: "Ukraine" },
  { code: "+381", country: "Serbia" },
  { code: "+382", country: "Montenegro" },
  { code: "+383", country: "Kosovo" },
  { code: "+385", country: "Croatia" },
  { code: "+386", country: "Slovenia" },
  { code: "+387", country: "Bosnia and Herzegovina" },
  { code: "+389", country: "North Macedonia" },
  { code: "+420", country: "Czech Republic" },
  { code: "+421", country: "Slovakia" },
  { code: "+423", country: "Liechtenstein" },
  { code: "+500", country: "Falkland Islands" },
  { code: "+501", country: "Belize" },
  { code: "+502", country: "Guatemala" },
  { code: "+503", country: "El Salvador" },
  { code: "+504", country: "Honduras" },
  { code: "+505", country: "Nicaragua" },
  { code: "+506", country: "Costa Rica" },
  { code: "+507", country: "Panama" },
  { code: "+509", country: "Haiti" },
  { code: "+590", country: "Guadeloupe" },
  { code: "+591", country: "Bolivia" },
  { code: "+592", country: "Guyana" },
  { code: "+593", country: "Ecuador" },
  { code: "+595", country: "Paraguay" },
  { code: "+598", country: "Uruguay" },
  { code: "+599", country: "Curaçao/Netherlands Antilles" },
  { code: "+670", country: "East Timor" },
  { code: "+672", country: "Norfolk Island" },
  { code: "+673", country: "Brunei" },
  { code: "+674", country: "Nauru" },
  { code: "+675", country: "Papua New Guinea" },
  { code: "+676", country: "Tonga" },
  { code: "+677", country: "Solomon Islands" },
  { code: "+678", country: "Vanuatu" },
  { code: "+679", country: "Fiji" },
  { code: "+680", country: "Palau" },
  { code: "+682", country: "Cook Islands" },
  { code: "+683", country: "Niue" },
  { code: "+685", country: "Samoa" },
  { code: "+686", country: "Kiribati" },
  { code: "+687", country: "New Caledonia" },
  { code: "+688", country: "Tuvalu" },
  { code: "+689", country: "French Polynesia" },
  { code: "+690", country: "Tokelau" },
  { code: "+691", country: "Micronesia" },
  { code: "+692", country: "Marshall Islands" },
  { code: "+850", country: "North Korea" },
  { code: "+852", country: "Hong Kong" },
  { code: "+853", country: "Macau" },
  { code: "+855", country: "Cambodia" },
  { code: "+856", country: "Laos" },
  { code: "+880", country: "Bangladesh" },
  { code: "+886", country: "Taiwan" },
  { code: "+960", country: "Maldives" },
  { code: "+961", country: "Lebanon" },
  { code: "+962", country: "Jordan" },
  { code: "+963", country: "Syria" },
  { code: "+964", country: "Iraq" },
  { code: "+965", country: "Kuwait" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+967", country: "Yemen" },
  { code: "+968", country: "Oman" },
  { code: "+970", country: "Palestine" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+972", country: "Israel" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+975", country: "Bhutan" },
  { code: "+976", country: "Mongolia" },
  { code: "+977", country: "Nepal" },
  { code: "+992", country: "Tajikistan" },
  { code: "+993", country: "Turkmenistan" },
  { code: "+994", country: "Azerbaijan" },
  { code: "+995", country: "Georgia" },
  { code: "+996", country: "Kyrgyzstan" },
  { code: "+998", country: "Uzbekistan" },
];

// Medical form options
const educationLevels = [
  "None", "Primary", "Secondary", "Tertiary", "University", "Postgraduate"
];

const maritalStatusOptions = [
  "Single", "Married", "Divorced", "Widowed", "Separated", "Partnered"
];

const livingArrangementOptions = [
  "Alone", "With family", "With partner", "With roommates", "Assisted living", "Other"
];

const contraceptiveOptions = [
  "None", "Oral contraceptives", "IUD", "Implant", "Injection", "Condoms", 
  "Diaphragm", "Rhythm method", "Sterilization", "Other"
];

const medicalConditions = [
  "Diabetes", "Hypertension", "Heart disease", "Asthma", "Cancer", 
  "Thyroid disorder", "Kidney disease", "Liver disease", "Autoimmune disease",
  "HIV/AIDS", "Hepatitis", "Sexually transmitted infection", "Mental health condition",
  "Neurological disorder", "None"
];

const familyHistoryConditions = [
  "Cancer", "Diabetes", "Heart disease", "Hypertension", "Stroke", 
  "Genetic disorders", "Autoimmune diseases", "None"
];

const dietaryOptions = [
  "Balanced diet", "High protein", "Vegetarian", "Vegan", "Gluten-free",
  "Lactose-free", "Low carb", "High carb", "Keto", "Paleo", "Other"
];

const commonSymptoms = [
  "None", "Abnormal vaginal bleeding", "Pelvic pain", "Vaginal discharge",
  "Pain during intercourse", "Post-coital bleeding", "Lower back pain",
  "Urinary problems", "Itching", "Burning sensation", "Weight loss", "Fatigue"
];

const frequencyOptions = [
  "None", "Rarely", "Occasionally", "Regularly", "Daily", "Multiple times daily"
];

const physicalActivityOptions = [
  "None", "Light (1-2 days/week)", "Moderate (3-4 days/week)", "Active (5-7 days/week)", "Very active"
];

const PatientRegistration = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: '',
    lastName: '',
    countryCode: '+1', // Default to US/Canada
    phoneNumber: '',
    dateOfBirth: undefined,
    
    // Initialize structured medical data
    sociodemographicData: {
      education: '',
      occupation: '',
      maritalStatus: '',
      livingArrangement: ''
    },
    
    reproductiveHistory: {
      pregnancies: '',
      births: '',
      abortions: '',
      lastMenstrualPeriod: '',
      contraceptiveUse: 'No',
      contraceptiveType: ''
    },
    
    medicalHistory: {
      existingConditions: [],
      medications: '',
      allergies: '',
      previousSurgeries: '',
      familyHistory: []
    },
    
    lifestyleFactors: {
      smokingStatus: 'No',
      smokingFrequency: '',
      alcoholUse: 'No',
      alcoholFrequency: '',
      physicalActivity: '',
      diet: []
    },
    
    symptoms: [],
    lastVisaExamDate: '',
    lastVisaExamResults: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmVerified, setConfirmVerified] = useState(false);
  const [confirmInformed, setConfirmInformed] = useState(false);
  const [yearView, setYearView] = useState(false);

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

  const handleCountryCodeChange = (value: string) => {
    setPatientData(prev => ({ ...prev, countryCode: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setPatientData(prev => ({ ...prev, dateOfBirth: date }));
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
    setYearView(false); // Reset to day view after selecting a date
  };

  // New handlers for structured data
  const handleSociodemographicChange = (field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      sociodemographicData: {
        ...prev.sociodemographicData,
        [field]: value
      }
    }));
  };
  
  const handleReproductiveHistoryChange = (field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      reproductiveHistory: {
        ...prev.reproductiveHistory,
        [field]: value
      }
    }));
  };
  
  const handleMedicalHistoryChange = (field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [field]: value
      }
    }));
  };
  
  const handleExistingConditionsChange = (condition: string, checked: boolean) => {
    setPatientData(prev => {
      const newConditions = checked
        ? [...prev.medicalHistory.existingConditions, condition]
        : prev.medicalHistory.existingConditions.filter(c => c !== condition);
      
      return {
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          existingConditions: newConditions
        }
      };
    });
  };
  
  const handleFamilyHistoryChange = (condition: string, checked: boolean) => {
    setPatientData(prev => {
      const newConditions = checked
        ? [...prev.medicalHistory.familyHistory, condition]
        : prev.medicalHistory.familyHistory.filter(c => c !== condition);
      
      return {
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          familyHistory: newConditions
        }
      };
    });
  };
  
  const handleLifestyleChange = (field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      lifestyleFactors: {
        ...prev.lifestyleFactors,
        [field]: value
      }
    }));
  };
  
  const handleDietChange = (diet: string, checked: boolean) => {
    setPatientData(prev => {
      const newDiet = checked
        ? [...prev.lifestyleFactors.diet, diet]
        : prev.lifestyleFactors.diet.filter(d => d !== diet);
      
      return {
        ...prev,
        lifestyleFactors: {
          ...prev.lifestyleFactors,
          diet: newDiet
        }
      };
    });
  };
  
  const handleSymptomsChange = (symptom: string, checked: boolean) => {
    setPatientData(prev => {
      const newSymptoms = checked
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom);
      
      return {
        ...prev,
        symptoms: newSymptoms
      };
    });
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
      
      if (patientData.phoneNumber && !/^\d{7,12}$/.test(patientData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number (7-12 digits)';
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
        // Prepare patient data for storage
        const patientDataForStorage = {
          ...patientData,
          screeningStep: 'before-acetic',
          phoneNumber: `${patientData.countryCode}${patientData.phoneNumber}`
        };
        
        // Convert structured data to string for compatibility with existing code
        localStorage.setItem('currentPatient', JSON.stringify(patientDataForStorage));
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

  // Toggle between year view and day view in the calendar
  const toggleYearView = () => {
    setYearView(!yearView);
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
                <div className="flex">
                  <Select 
                    value={patientData.countryCode} 
                    onValueChange={handleCountryCodeChange}
                  >
                    <SelectTrigger className="w-[30%] rounded-r-none border-r-0">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-none rounded-r-md"
                    placeholder="e.g. 5551234567"
                    value={patientData.phoneNumber}
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
                        onClick={toggleYearView}
                        className="text-xs font-medium"
                      >
                        {yearView ? "View Calendar" : "View Years"}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    {yearView ? (
                      <div className="p-2 h-[260px] overflow-y-auto grid grid-cols-4 gap-2">
                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <Button
                            key={year}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newDate = patientData.dateOfBirth 
                                ? new Date(patientData.dateOfBirth) 
                                : new Date();
                              newDate.setFullYear(year);
                              handleDateChange(newDate);
                            }}
                            className={cn(
                              "text-sm",
                              patientData.dateOfBirth && patientData.dateOfBirth.getFullYear() === year
                                ? "bg-primary text-primary-foreground"
                                : ""
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
                        disabled={(date) => date > new Date()}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    )}
                  </PopoverContent>
                </Popover>
                {errors.dateOfBirth && <p className="text-destructive text-xs">{errors.dateOfBirth}</p>}
              </div>
            </div>
          </section>
        );
      case 2:
        return (
          <section className="bg-white rounded-xl p-6 shadow-sm max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-medium mb-4">Medical Information</h2>
            
            {/* Sociodemographic Data */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3">Sociodemographic Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select 
                    value={patientData.sociodemographicData.education} 
                    onValueChange={(value) => handleSociodemographicChange('education', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
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
                    value={patientData.sociodemographicData.occupation}
                    onChange={(e) => handleSociodemographicChange('occupation', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select 
                    value={patientData.sociodemographicData.maritalStatus} 
                    onValueChange={(value) => handleSociodemographicChange('maritalStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="livingArrangement">Living Arrangement</Label>
                  <Select 
                    value={patientData.sociodemographicData.livingArrangement} 
                    onValueChange={(value) => handleSociodemographicChange('livingArrangement', value)}
                  >
                    <SelectTrigger>
                      <Select
