// components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { format, Locale } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  locale?: Locale;
  placeholderText?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
  showMonthYearPicker?: boolean;
  monthsShown?: number;
  required?: boolean;
}

export function DatePicker({
  selected,
  onSelect,
  locale = fr,
  placeholderText = "Sélectionner une date",
  disabled = false,
  className,
  fromYear,
  toYear,
  monthsShown = 1,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Calculer les limites d'années
  const currentYear = new Date().getFullYear();
  const fromDate = React.useMemo(() => 
    fromYear ? new Date(fromYear, 0, 1) : new Date(currentYear - 100, 0, 1), 
    [fromYear, currentYear]
  );
  const toDate = React.useMemo(() => 
    toYear ? new Date(toYear, 11, 31) : new Date(currentYear + 5, 11, 31), 
    [toYear, currentYear]
  );

  const handleSelect = (date: Date | undefined) => {
    onSelect(date || null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            <span className="flex-1">
              {format(selected, "dd MMMM yyyy", { locale })}
              {!disabled && (
                <span 
                  className="ml-2 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                >
                  ✕
                </span>
              )}
            </span>
          ) : (
            <span className="flex-1">{placeholderText}</span>
          )}
          {required && <span className="text-destructive ml-1">*</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected || undefined}
          onSelect={handleSelect}
          initialFocus
          locale={locale}
          fromDate={fromDate}
          toDate={toDate}
          numberOfMonths={monthsShown}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;