import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface TagIconProps extends LucideProps {
    icon: string;
}

export function TagIcon({ icon, ...props }: TagIconProps) {
    if (!icon) return null;

    if (icon.trim().startsWith("<svg")) {
        return (
            <div
                className={props.className as string}
                dangerouslySetInnerHTML={{ __html: icon }}
            />
        );
    }

    const LucideIcon = (LucideIcons as Record<string, any>)[icon];
    if (LucideIcon) {
        return <LucideIcon {...props} />;
    }

    return <span className="leading-none">{icon}</span>;
}
