import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface ColorPickerPresetColor {
    name: string;
    value: string;
}

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    presetColors?: ColorPickerPresetColor[];
}

const DEFAULT_PRESET_COLORS: ColorPickerPresetColor[] = [
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Orange", value: "#f97316" },
    { name: "Brown", value: "#78350f" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Gray", value: "#4b5563" },
    { name: "Dark", value: "#18181b" },
];

export function ColorPicker({
    value,
    onChange,
    presetColors = DEFAULT_PRESET_COLORS,
}: ColorPickerProps) {
    const { t } = useTranslation();
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleCustomColorClick = () => {
        colorInputRef.current?.click();
    };

    return (
        <div className="relative">
            <input
                ref={colorInputRef}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-start gap-2 font-normal"
                    >
                        <span
                            className="w-5 h-5 rounded-md border shadow-sm shrink-0"
                            style={{ backgroundColor: value }}
                        />
                        <span className="font-mono text-xs text-muted-foreground">{value}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-3" align="start">
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                            {presetColors.map((color) => (
                                <Button
                                    key={color.value}
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onChange(color.value)}
                                    className={cn(
                                        "w-7 h-7 rounded-full p-0 hover:scale-110 transition-transform",
                                        value === color.value && "ring-2 ring-primary ring-offset-2 ring-offset-popover"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <div className="border-t pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={handleCustomColorClick}
                            >
                                <span className="w-4 h-4 rounded border" style={{ backgroundColor: value }} />
                                {t("product.tagCustomColor")}
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
