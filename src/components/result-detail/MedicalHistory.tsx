import React from 'react';
import { ScreeningResult } from '@/services/screeningService';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MedicalHistoryData {
  sociodemographic?: {
    education?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  lifestyle?: {
    smoking?: string;
    alcohol?: string;
    physicalActivity?: string;
  };
  medical?: {
    conditions?: string[] | string;
    symptoms?: string[] | string;
    reproductiveHistory?: string;
    lastVisaExamResults?: string;
  };
}

interface MedicalHistoryProps {
  result: ScreeningResult;
}

const MedicalHistory = ({ result }: MedicalHistoryProps) => {
  const formatMedicalHistory = (medicalHistoryData: string | null) => {
    if (!medicalHistoryData) return null;
    
    try {
      let medicalHistory: MedicalHistoryData;
      
      if (typeof medicalHistoryData === 'string') {
        try {
          medicalHistory = JSON.parse(medicalHistoryData) as MedicalHistoryData;
        } catch (e) {
          console.error('Error parsing medical history:', e);
          return <p className="text-red-500">Error parsing medical history</p>;
        }
      } else {
        medicalHistory = medicalHistoryData as unknown as MedicalHistoryData;
      }
      
      console.log('Formatting medical history:', JSON.stringify(medicalHistory, null, 2));
      
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Full Name</div>
              <div className="font-medium">{result.patients?.first_name} {result.patients?.last_name}</div>
              
              <div className="text-muted-foreground">Date of Birth</div>
              <div className="font-medium">
                {result.patients?.date_of_birth
                  ? format(new Date(result.patients.date_of_birth), 'MMM d, yyyy')
                  : 'Not available'}
              </div>
              
              <div className="text-muted-foreground">Contact Number</div>
              <div className="font-medium">{result.patients?.contact_number || 'Not available'}</div>
              
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{result.patients?.email || 'Not available'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Sociodemographic Data</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Education</div>
              <div className="font-medium">{medicalHistory.sociodemographic?.education || 'Not available'}</div>
              
              <div className="text-muted-foreground">Occupation</div>
              <div className="font-medium">{medicalHistory.sociodemographic?.occupation || 'Not available'}</div>
              
              <div className="text-muted-foreground">Marital Status</div>
              <div className="font-medium">{medicalHistory.sociodemographic?.maritalStatus || 'Not available'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Lifestyle Factors</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Smoking</div>
              <div className="font-medium">{medicalHistory.lifestyle?.smoking || 'Not available'}</div>
              
              <div className="text-muted-foreground">Alcohol</div>
              <div className="font-medium">{medicalHistory.lifestyle?.alcohol || 'Not available'}</div>
              
              <div className="text-muted-foreground">Physical Activity</div>
              <div className="font-medium">{medicalHistory.lifestyle?.physicalActivity || 'Not available'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Medical Information</h3>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Medical Conditions</div>
              <div className="font-medium">
                {medicalHistory.medical?.conditions ? (
                  Array.isArray(medicalHistory.medical.conditions) ? (
                    medicalHistory.medical.conditions.length > 0 ? (
                      medicalHistory.medical.conditions.includes("None") ? (
                        "None"
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {medicalHistory.medical.conditions.map((condition: string, index: number) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      )
                    ) : "None"
                  ) : (
                    medicalHistory.medical.conditions === "None" ? 
                      "None" : medicalHistory.medical.conditions
                  )
                ) : "None"}
              </div>
              
              <div className="text-muted-foreground">Symptoms</div>
              <div className="font-medium">
                {medicalHistory.medical?.symptoms ? (
                  Array.isArray(medicalHistory.medical.symptoms) ? (
                    medicalHistory.medical.symptoms.length > 0 ? (
                      medicalHistory.medical.symptoms.includes("None") ? (
                        "None"
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {medicalHistory.medical.symptoms.map((symptom: string, index: number) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      )
                    ) : "None"
                  ) : (
                    medicalHistory.medical.symptoms === "None" ? 
                      "None" : medicalHistory.medical.symptoms
                  )
                ) : "None"}
              </div>
              
              {medicalHistory.medical?.reproductiveHistory && (
                <>
                  <div className="text-muted-foreground">Reproductive History</div>
                  <div className="font-medium">{medicalHistory.medical.reproductiveHistory}</div>
                </>
              )}
              
              {medicalHistory.medical?.lastVisaExamResults && (
                <>
                  <div className="text-muted-foreground">Last Visa Exam Results</div>
                  <div className="font-medium">{medicalHistory.medical.lastVisaExamResults}</div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    } catch (e) {
      console.error('Error formatting medical history:', e);
      return <p className="text-red-500">Error displaying medical history: {(e as Error).message}</p>;
    }
  };
  
  return (
    <div className="mt-6 mb-6">
      <Collapsible className="border rounded-md overflow-hidden">
        <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-muted/30 hover:bg-muted/50 transition-all">
          <span className="font-medium">Patient Information and Medical History</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform ui-open:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 space-y-2">
          {result.patients?.medical_history ? (
            formatMedicalHistory(result.patients.medical_history)
          ) : (
            <p className="text-sm text-muted-foreground">No medical history available</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MedicalHistory;
