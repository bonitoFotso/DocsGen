import React, { useCallback, useEffect, useState } from 'react';
import { DivideIcon as LucideIcon, Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from "@/lib/utils";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  icon?: typeof LucideIcon;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  description?: string;
  className?: string;
  options?: { value: string; label: string | null }[];
  isLoading?: boolean;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  validate?: (value: string) => string | undefined;
  clearable?: boolean;
  success?: boolean;
  helperText?: string;
}

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  icon: Icon,
  error,
  placeholder,
  disabled = false,
  autoComplete,
  description,
  className = '',
  options = [],
  isLoading = false,
  pattern,
  maxLength,
  minLength,
  validate,
  clearable = false,
  success = false,
  helperText,
}: InputFieldProps) => {
  const id = React.useId();
  const [localError, setLocalError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validation en temps réel
  const validateField = useCallback((value: string) => {
    if (required && !value) {
      return 'Ce champ est requis';
    }
    if (minLength && value.length < minLength) {
      return `Minimum ${minLength} caractères`;
    }
    if (maxLength && value.length > maxLength) {
      return `Maximum ${maxLength} caractères`;
    }
    if (pattern && !new RegExp(pattern).test(value)) {
      return 'Format invalide';
    }
    if (validate) {
      return validate(value);
    }
    return undefined;
  }, [required, minLength, maxLength, pattern, validate]);

  useEffect(() => {
    if (isDirty) {
      setLocalError(validateField(value));
    }
  }, [value, isDirty, validateField]);

  const handleChange = (newValue: string) => {
    setIsDirty(true);
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsDirty(true);
    setLocalError(validateField(value));
  };

  const currentError = error || localError;
  const effectiveType = showPassword ? 'text' : type;

  const renderInputElement = () => {
    const commonProps = {
      id,
      value,
      required,
      placeholder,
      disabled: disabled || isLoading,
      autoComplete,
      onBlur: handleBlur,
      'aria-invalid': currentError ? true : false,
      'aria-describedby': currentError ? `${id}-error` : helperText ? `${id}-helper` : undefined,
      maxLength,
      minLength,
      pattern,
      className: cn(
        "w-full",
        currentError && "border-red-500 focus-visible:ring-red-500",
        success && "border-green-500 focus-visible:ring-green-500"
      ),
    };

    if (type === 'select') {
      return (
        <Select
          value={value}
          onValueChange={handleChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className={commonProps.className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          {...commonProps}
          onChange={e => handleChange(e.target.value)}
          rows={3}
        />
      );
    }

    return (
      <div className="relative">
        <Input
          {...commonProps}
          type={effectiveType}
          onChange={e => handleChange(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          )}

          {!isLoading && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {!isLoading && clearable && value && (
            <button
              type="button"
              onClick={() => handleChange('')}
              className="text-muted-foreground hover:text-foreground focus:outline-none p-1 rounded-full hover:bg-muted"
              aria-label="Effacer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {!isLoading && !currentError && success && (
            <Check className="h-4 w-4 text-green-500" />
          )}

          {!isLoading && currentError && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={cn(
            "flex items-center space-x-2",
            currentError && "text-red-500",
            disabled && "opacity-50"
          )}
        >
          {Icon && <Icon className={cn("h-4 w-4", currentError ? "text-red-400" : "text-muted-foreground")} />}
          <span>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </Label>

        {maxLength && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {renderInputElement()}

      {(currentError || helperText) && (
        <p 
          className={cn(
            "text-sm",
            currentError ? "text-red-500" : "text-muted-foreground"
          )}
          id={currentError ? `${id}-error` : `${id}-helper`}
        >
          {currentError || helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;