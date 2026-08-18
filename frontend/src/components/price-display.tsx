interface PriceDisplayProps {
  value: number;
  currency: string;
  className?: string;
}

function renderIntegerPart(text: string) {
  return <span>{text}</span>;
}

function renderDecimalPart(text: string) {
  return (
    <span className="text-muted-foreground text-[0.85em]">
      {text}
    </span>
  );
}

export function PriceDisplay({ value, currency, className }: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const commaIndex = formatted.lastIndexOf(",");

  function renderFormatted() {
    if (commaIndex === -1) {
      return renderIntegerPart(formatted);
    }
    return (
      <>
        {renderIntegerPart(formatted.slice(0, commaIndex))}
        {renderDecimalPart(formatted.slice(commaIndex))}
      </>
    );
  }

  return (
    <span className={className}>
      <span className="font-semibold">{renderFormatted()}</span>{" "}
      <span className="text-muted-foreground text-xs">{currency}</span>
    </span>
  );
}
