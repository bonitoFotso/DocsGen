import React from 'react';
import { DivideIcon as LucideIcon, Loader2 } from 'lucide-react';

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
}: InputFieldProps) => {
  const id = React.useId();
  const [isFocused, setIsFocused] = React.useState(false);

  const renderInput = () => {
    const commonProps = {
      id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(e.target.value),
      required,
      placeholder,
      disabled: disabled || isLoading,
      autoComplete,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      className: `
        block w-full rounded-md shadow-sm text-sm
        ${disabled || isLoading ? 'bg-gray-50 text-gray-500' : 'bg-white'}
        ${error
          ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        }
        transition-shadow duration-150
        ${isFocused ? 'ring-2 ring-opacity-50' : ''}
      `,
      'aria-invalid': error ? true : false,
      'aria-describedby': error ? `${id}-error` : undefined,
    };

    if (type === 'select') {
      return (
        <select {...commonProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          rows={3}
        />
      );
    }

    return <input {...commonProps} type={type} />;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={id}
        className={`
          block text-sm font-medium
          ${error ? 'text-red-600' : 'text-gray-700'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-gray-400" />}
          <span>{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
        </div>
      </label>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      <div className="relative">
        {renderInput()}

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;