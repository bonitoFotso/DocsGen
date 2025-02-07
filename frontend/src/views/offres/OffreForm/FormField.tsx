import React from 'react';
import { Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  helpText?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  helpText,
  required,
}) => (
  <div className="space-y-2.5">
    <label className="block text-sm font-semibold text-gray-700 tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {helpText && (
      <p className="text-sm text-gray-500 flex items-center gap-1.5">
        <Info className="w-4 h-4" />
        {helpText}
      </p>
    )}
  </div>
);