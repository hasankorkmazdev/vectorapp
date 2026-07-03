import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function FieldDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[10px] text-muted-foreground mt-1", className)}
      {...props}
    />
  );
}
