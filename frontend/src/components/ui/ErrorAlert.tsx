import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  return (
    <div className="mx-6 mt-4">
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={onDismiss}
            className="ml-auto text-red-400 hover:text-red-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};