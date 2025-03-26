import { format, Locale } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  locale?: Locale;
}

export function DatePicker({
  id,
  selected,
  onSelect,
  locale
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            format(selected, "PPP", { locale })
          ) : (
            <span>Sélectionner une date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected as Date | undefined}
          onSelect={(date: Date | undefined) => onSelect?.(date || null)}
          initialFocus
          required={false}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
} 