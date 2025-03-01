
import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

const FormField = ({
  id,
  label,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  error,
  className,
  multiline = false,
  rows = 3
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <Label 
          htmlFor={id} 
          className={cn(
            "text-sm font-medium",
            required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""
          )}
        >
          {label}
        </Label>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      
      {multiline ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className={cn(
            "w-full resize-none input-focus-ring",
            error ? "border-destructive" : ""
          )}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full input-focus-ring",
            error ? "border-destructive" : ""
          )}
        />
      )}
    </div>
  );
};

export default FormField;
