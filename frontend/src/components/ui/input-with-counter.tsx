import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface InputWithCounterProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  warningThreshold?: number;
}

export const InputWithCounter = React.forwardRef<HTMLInputElement, InputWithCounterProps>(
  (
    {
      className,
      type = "text",
      value,
      onChange,
      maxLength = 100,
      warningThreshold = 80,
      ...props
    },
    ref
  ) => {
    const currentLength = value.length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length <= maxLength) {
        onChange(val);
      }
    };

    // Border color logic based on input length:
    let borderClass = "border-border focus:ring-primary";
    let textCounterColorClass = "text-muted-foreground";

    if (currentLength >= maxLength) {
      borderClass = "border-red-500 focus:ring-red-500 ring-red-500";
      textCounterColorClass = "text-red-500 font-semibold";
    } else if (currentLength >= warningThreshold) {
      borderClass = "border-yellow-500 focus:ring-yellow-500 ring-yellow-500";
      textCounterColorClass = "text-yellow-600 dark:text-yellow-500 font-medium";
    }

    return (
      <div className="relative w-full flex flex-col gap-1">
        <Input
          type={type}
          value={value}
          onChange={handleChange}
          ref={ref}
          className={cn(
            "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 text-foreground transition-all duration-200",
            borderClass,
            className
          )}
          {...props}
        />
        <div className="flex justify-end">
          <span className={cn("text-[10px] tracking-wide", textCounterColorClass)}>
            {currentLength}/{maxLength}
          </span>
        </div>
      </div>
    );
  }
);

InputWithCounter.displayName = "InputWithCounter";
