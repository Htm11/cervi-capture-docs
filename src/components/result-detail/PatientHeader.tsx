
import React from 'react';
import { format } from 'date-fns';
import { Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { ScreeningResult } from '@/services/screeningService';

interface PatientHeaderProps {
  result: ScreeningResult;
}

const PatientHeader = ({ result }: PatientHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-xl font-semibold">
          {result.patients?.first_name} {result.patients?.last_name}
        </h1>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Phone className="h-3 w-3 mr-1" />
          <span>{result.patients?.contact_number || 'No phone number'}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {result.created_at 
              ? format(new Date(result.created_at), 'MMM d, yyyy') 
              : 'Date not available'}
          </span>
        </div>
      </div>
      
      {result.result === 'positive' ? (
        <div className="flex items-center text-red-500 bg-red-50 py-1 px-3 rounded-full">
          <XCircle className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Positive</span>
        </div>
      ) : (
        <div className="flex items-center text-green-500 bg-green-50 py-1 px-3 rounded-full">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Negative</span>
        </div>
      )}
    </div>
  );
};

export default PatientHeader;
