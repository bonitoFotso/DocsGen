import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  }[type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg animate-slideIn ${bgColor}`}>
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-2" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};