import { useTranslation } from "react-i18next";

interface LogoProps {
    size?: "sm" | "md";
}

function LogoIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="120.58 130.61 245.4 218.12"
            className={className}
            fill="currentColor"
        >
            <path d="M318.75 131.1c-17.75 2-21.65 6.5-55.05 63.4-35.5 60.55-39.65 67.6-49.05 83.4-9.65 16.3-11 20.45-10.45 32.1 1.35 28.8 31.25 47.1 56.85 34.9 13.7-6.55 8.65.7 60.65-87.4 45.4-76.95 45.15-76.45 43.95-89.1-2.2-23.85-22.65-40.1-46.9-37.3M146.9 133.3c-38.85 16.3-33.4 72.7 7.8 80.75 39.5 7.7 65.95-41.2 38.2-70.55-11.1-11.75-31.5-16.25-46-10.2" />
        </svg>
    );
}

export function Logo({ size = "md" }: LogoProps) {
    const { t } = useTranslation();
    const iconSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
    const textSize = size === "sm" ? "text-xl" : "text-2xl";

    return (
        <div className="flex items-center gap-3">
            <LogoIcon className={`${iconSize} text-foreground`} />
            <span
                className={`${textSize} font-extrabold tracking-wide`}
                style={{
                    fontFamily: "'Panchang', sans-serif",
                    fontWeight: 400,
                    background: "linear-gradient(135deg, #2b348f, #3949ab, #5c6bc0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}
            >
                {t("common.appName")}
            </span>
        </div>
    );
}
