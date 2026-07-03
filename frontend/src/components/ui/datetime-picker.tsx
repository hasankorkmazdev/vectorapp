import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Tarih ve saat seçin",
  disabled = false,
  disablePastDates = false,
  required = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
  required?: boolean;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : "00:00"
  );
  
  React.useEffect(() => {
    if (value) {
      const parsedDate = new Date(value);
      setDate(parsedDate);
      setTime(format(parsedDate, "HH:mm"));
    } else {
      setDate(undefined);
      setTime("00:00");
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      selectedDate.setHours(hours || 0);
      selectedDate.setMinutes(minutes || 0);
      setDate(selectedDate);
      
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedLocalISO = `${year}-${month}-${day}T${time}:00`;
      
      onChange(formattedLocalISO);
    } else {
      setDate(undefined);
      onChange("");
    }
  };

  const updateTime = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const updatedDate = new Date(date);
      updatedDate.setHours(hours);
      updatedDate.setMinutes(minutes);
      setDate(updatedDate);
      
      const year = updatedDate.getFullYear();
      const month = String(updatedDate.getMonth() + 1).padStart(2, '0');
      const day = String(updatedDate.getDate()).padStart(2, '0');
      const formattedLocalISO = `${year}-${month}-${day}T${newTime}:00`;
      
      onChange(formattedLocalISO);
    }
  };

  const handleHourChange = (newHour: string) => {
    const [, minute] = time.split(":");
    updateTime(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const [hour] = time.split(":");
    updateTime(`${hour}:${newMinute}`);
  };

  const [currentHour, currentMinute] = time.split(":");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-background h-10",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {date ? format(date, "PPP HH:mm", { locale: tr }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={tr}
          disabled={disablePastDates ? { before: new Date(new Date().setHours(0, 0, 0, 0)) } : undefined}
          required={required}
        />
        <div className="p-3 border-t border-border flex items-center justify-between gap-4 bg-muted/10">
           <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
             <Clock className="w-4 h-4" />
             Saat
           </div>
           <div className="flex items-center gap-1">
             <Select value={currentHour} onValueChange={handleHourChange}>
               <SelectTrigger className="w-[60px] h-8 text-sm focus:ring-1 focus:ring-offset-0 bg-background">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent position="popper" className="max-h-[200px]">
                 {Array.from({ length: 24 }).map((_, i) => {
                   const h = i.toString().padStart(2, '0');
                   return <SelectItem key={h} value={h}>{h}</SelectItem>;
                 })}
               </SelectContent>
             </Select>
             <span className="text-muted-foreground font-medium">:</span>
             <Select value={currentMinute} onValueChange={handleMinuteChange}>
               <SelectTrigger className="w-[60px] h-8 text-sm focus:ring-1 focus:ring-offset-0 bg-background">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent position="popper" className="max-h-[200px]">
                 {Array.from({ length: 60 }).map((_, i) => {
                   const m = i.toString().padStart(2, '0');
                   return <SelectItem key={m} value={m}>{m}</SelectItem>;
                 })}
               </SelectContent>
             </Select>
           </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
