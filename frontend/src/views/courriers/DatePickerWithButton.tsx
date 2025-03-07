// components/DatePickerWithButton.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';

interface DatePickerWithButtonProps {
  onConfirm: (date: Date | null) => void;
  isLoading?: boolean;
  buttonText?: string;
  defaultDate?: Date;
  placeholderText?: string;
}

const DatePickerWithButton: React.FC<DatePickerWithButtonProps> = ({
  onConfirm,
  isLoading = false,
  buttonText = "Confirmer",
  defaultDate,
  placeholderText = "Sélectionner une date"
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate || null);

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        selected={selectedDate}
        onSelect={setSelectedDate}
        locale={fr}
        placeholderText={placeholderText}
      />
      <Button 
        onClick={handleConfirm} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Traitement...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );
};

export default DatePickerWithButton;