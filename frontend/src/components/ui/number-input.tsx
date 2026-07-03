import * as React from "react"
import { Input } from "./input"

interface NumberInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (val: number | undefined) => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      value !== undefined && value !== null ? value.toString() : ""
    )

    React.useEffect(() => {
      if (value === undefined || value === null) {
        if (displayValue !== "") {
          setDisplayValue("");
        }
        return;
      }
      const parsed = parseFloat(displayValue);
      if (value !== parsed) {
        setDisplayValue(value.toString());
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valStr = e.target.value;
      
      // Virgülü noktaya çevirerek Türkçe ve Avrupa klavye düzenlerini de destekleyelim
      const normalizedStr = valStr.replace(",", ".");
      
      // Kullanıcının geçici olarak boşluk, eksi veya nokta girmesine izin verelim
      if (normalizedStr === "" || normalizedStr === "-" || normalizedStr === "." || normalizedStr === "-.") {
        setDisplayValue(normalizedStr);
        if (onChange) {
          onChange(undefined);
        }
        return;
      }

      // Geçerli bir sayı ise state'i güncelle ve parent bileşene ilet
      if (!isNaN(Number(normalizedStr))) {
        setDisplayValue(normalizedStr);
        if (onChange) {
          onChange(Number(normalizedStr));
        }
      }
    };

    return (
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
)
NumberInput.displayName = "NumberInput"
