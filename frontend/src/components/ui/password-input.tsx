import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export interface PasswordInputProps extends React.ComponentProps<"input"> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    function renderToggleIcon() {
        if (showPassword) {
            return <EyeOffIcon className="h-4 w-4" />;
        }
        return <EyeIcon className="h-4 w-4" />;
    }

    return (
      <InputGroup className={cn("w-full", className)}>
        <InputGroupInput
          type={showPassword ? "text" : "password"}
          className="flex-1"
          ref={ref}
          {...props}
        />
        <InputGroupAddon
          align="inline-end"
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {renderToggleIcon()}
        </InputGroupAddon>
      </InputGroup>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
