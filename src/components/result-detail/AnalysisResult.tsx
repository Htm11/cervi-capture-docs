
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { ScreeningResult } from '@/services/screeningService';

interface AnalysisResultProps {
  result: ScreeningResult;
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  return (
    <div className="mt-6">
      <h2 className="text-md font-medium mb-2">Analysis Result</h2>
      {result.result === 'positive' ? (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-center space-x-3 mb-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="font-medium text-red-800">Positive</p>
          </div>
          <p className="text-sm text-red-600">
            Abnormal cells detected. Further examination is recommended.
          </p>
          {result.confidence && (
            <p className="text-xs text-muted-foreground mt-2">
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="font-medium text-green-800">Negative</p>
          </div>
          <p className="text-sm text-green-600">
            No abnormal cells detected. Regular check-ups recommended.
          </p>
          {result.confidence && (
            <p className="text-xs text-muted-foreground mt-2">
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
