// ModalHeader.tsx
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/common/CustomAlert';

interface ModalHeaderProps {
  title: string;
  isError: boolean;
}

export const ModalHeader = ({ title, isError }: ModalHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Remplissez les informations du contact
        </p>
      </div>
      {isError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des données
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};