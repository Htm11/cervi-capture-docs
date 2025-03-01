
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type Step = {
  id: number;
  label: string;
  description?: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const Stepper = ({ steps, currentStep, onStepClick, className }: StepperProps) => {
  return (
    <div className={cn("w-full pb-6", className)}>
      <div className="flex justify-between">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <div 
              key={step.id} 
              className={cn(
                "flex flex-col items-center relative",
                onStepClick && "cursor-pointer"
              )}
              onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
            >
              {/* Step connector line */}
              {step.id < steps.length && (
                <div 
                  className={cn(
                    "absolute h-[2px] top-4 left-1/2 right-0 w-full",
                    isCompleted ? "bg-cervi-500" : "bg-gray-200"
                  )}
                  style={{ width: 'calc(100% - 2rem)' }}
                />
              )}
              
              {/* Step circle */}
              <div 
                className={cn(
                  "z-10 flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium",
                  isCompleted ? "bg-cervi-500 text-white" : (
                    isActive ? "bg-cervi-100 border-2 border-cervi-500 text-cervi-800" : "bg-gray-200 text-gray-500"
                  )
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step label */}
              <div className="text-center mt-2">
                <p 
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-cervi-800" : (isCompleted ? "text-cervi-600" : "text-gray-500")
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
