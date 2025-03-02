
import React from 'react';
import { ScreeningResult } from '@/services/screeningService';

interface NotesProps {
  notes?: string;
}

const Notes = ({ notes }: NotesProps) => {
  if (!notes) return null;
  
  return (
    <div className="mt-6">
      <h2 className="text-md font-medium mb-2">Notes</h2>
      <p className="text-sm text-muted-foreground">{notes}</p>
    </div>
  );
};

export default Notes;
