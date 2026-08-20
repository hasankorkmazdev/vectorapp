import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function FieldDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
}
