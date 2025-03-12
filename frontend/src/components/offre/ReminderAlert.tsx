// components/offre/ReminderAlert.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReminderAlertProps {
  date: string;
}

const ReminderAlert: React.FC<ReminderAlertProps> = ({ date }) => {
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        Cette offre nécessite une relance depuis le {formatDate(date)}
      </AlertDescription>
    </Alert>
  );
};

export default ReminderAlert;