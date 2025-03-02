
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        const storageData = {
          ...patientData,
          screeningStep: 'before-acetic',
          phoneNumber: `${patientData.countryCode}${patientData.phoneNumber}`,
          
          sociodemographicData: `Education: ${patientData.education}, Occupation: ${patientData.occupation}, Marital Status: ${patientData.maritalStatus}`,
          medicalHistory: `Existing Conditions: ${patientData.existingConditions.join(', ')}`,
          lifestyleFactors: `Smoking: ${patientData.smokingStatus}, Alcohol: ${patientData.alcoholUse}, Physical Activity: ${patientData.physicalActivity}`,
          symptoms: patientData.commonSymptoms.join(', ')
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

  const toggleYearView = () => {
    setYearView(!yearView);
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
                  <input
                    id="occupation"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter occupation"
                    value={patientData.occupation}
                    onChange={handleChange}
                  />
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
              <h3 className="text-md font-medium mb-2">Lifestyle Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm">Smoking Status</Label>
                  <RadioGroup
                    value={patientData.smokingStatus}
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
                    value={patientData.alcoholUse}
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
              <FormField
                id="reproductiveHistory"
                label="Reproductive History"
                multiline
                placeholder="Enter details about pregnancies, births, contraceptive use, etc."
                value={patientData.reproductiveHistory}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
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
      <div className="pb-16">
        <Stepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
          className="mb-6"
        />
        
        <form className="space-y-8 mb-24"> {/* Added bottom margin to account for fixed buttons */}
          {renderStepContent()}
        </form>
        
        {/* New sticky navigation buttons */}
        <div className="fixed bottom-0 left-0 right-0 py-4 px-4 bg-white border-t border-border shadow-sm z-10">
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
