import { useState, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldDescription } from "@/components/field-description";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface TagInputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  icon?: ReactNode;
  values: string[];
  onAdd: (items: string[]) => void;
  onRemove: (index: number) => void;
  regex?: RegExp;
  invalidMessage?: string;
}

export function TagInput({
  label,
  required,
  placeholder,
  description,
  icon,
  values,
  onAdd,
  onRemove,
  regex,
  invalidMessage,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const add = () => {
    const raw = input.trim();
    if (!raw) return;

    const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (regex) {
      const invalid = items.filter((s) => !regex.test(s));
      if (invalid.length > 0) {
        clearTimeout(timer.current);
        setError(invalidMessage || "");
        timer.current = setTimeout(() => setError(""), 2000);
        return;
      }
    }
    onAdd(items);
    setInput("");
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <InputGroup>
        {icon && (
          <InputGroupAddon align="inline-start">
            {icon}
          </InputGroupAddon>
        )}
        <InputGroupInput
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Tab" && input.trim()) {
              add();
            }
          }}
        />
      </InputGroup>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((item, index) => (
            <Badge key={index} variant="secondary">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-destructive ml-1"
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
    </div>
  );
}
