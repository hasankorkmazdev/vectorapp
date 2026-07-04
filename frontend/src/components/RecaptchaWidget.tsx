import { useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTheme } from "next-themes";

interface RecaptchaWidgetProps {
    onVerify: (token: string | null) => void;
    resetKey?: number;
}

export function RecaptchaWidget({ onVerify, resetKey }: RecaptchaWidgetProps) {
    const { resolvedTheme } = useTheme();
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const isEnabled = import.meta.env.VITE_RECAPTCHA_ENABLED === "true";

    useEffect(() => {
        if (!isEnabled) {
            onVerify("development_bypass");
        }
    }, [isEnabled, onVerify, resetKey]);

    if (!isEnabled) return null;

    return (
        <div className="flex justify-center">
            <ReCAPTCHA
                key={resetKey}
                sitekey={siteKey}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onChange={onVerify}
                onExpired={() => onVerify(null)}
                onError={() => onVerify(null)}
            />
        </div>
    );
}
