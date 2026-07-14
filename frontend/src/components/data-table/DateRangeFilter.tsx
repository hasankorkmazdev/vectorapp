import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FilterValue } from "./types";

interface DateRangeFilterProps {
  filter: FilterValue | undefined;
  onChange: (filter: FilterValue | null) => void;
  field: string;
}

export function DateRangeFilter({
  filter,
  onChange,
  field,
}: DateRangeFilterProps) {
  const { t } = useTranslation();
  const fromPlaceholder = t("dataTable.startDate");
  const toPlaceholder = t("dataTable.endDate");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const fromDate = filter?.from ? new Date(filter.from) : undefined;
  const toDate = filter?.to ? new Date(filter.to) : undefined;

  function handleFromSelect(date: Date | undefined) {
    setFromOpen(false);
    const from = date ? format(date, "yyyy-MM-dd") : "";
    const to = filter?.to || "";
    if (from || to) {
      onChange({ type: "date", field, from, to });
    } else {
      onChange(null);
    }
  }

  function handleToSelect(date: Date | undefined) {
    setToOpen(false);
    const from = filter?.from || "";
    const to = date ? format(date, "yyyy-MM-dd") : "";
    if (from || to) {
      onChange({ type: "date", field, from, to });
    } else {
      onChange(null);
    }
  }

  return (
    <div className="flex gap-1 items-center">
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs px-2 w-[90px] justify-start font-normal",
              !fromDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">
              {fromDate ? format(fromDate, "dd.MM.yyyy") : fromPlaceholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={handleFromSelect}
            locale={tr}
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">-</span>

      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs px-2 w-[90px] justify-start font-normal",
              !toDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">
              {toDate ? format(toDate, "dd.MM.yyyy") : toPlaceholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={handleToSelect}
            locale={tr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
