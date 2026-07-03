import { useEffect } from "react";
import { authService } from "@/services/auth-service";
import { useAppStore } from "@/store/app-store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

interface GoogleLoginButtonProps {
    role?: string;
    textKey?: string;
    onGoogleSelect?: (data: { email: string; fullName: string }) => void;
}

export function GoogleLoginButton({ role = "Respondent", textKey = "login.google", onGoogleSelect }: GoogleLoginButtonProps) {
    const login = useAppStore((state) => state.login);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();

    const decodeGoogleToken = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT token", e);
            return null;
        }
    };

    useEffect(() => {
        // Initialize Google Identity Services
        const initGoogleSignIn = () => {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            const google = (window as any).google;
            
            if (google?.accounts?.id) {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                });

                google.accounts.id.renderButton(
                    document.getElementById("googleButtonDiv"),
                    { 
                        theme: resolvedTheme === "dark" ? "filled_black" : "outline", 
                        size: "large", 
                        width: 320,
                        text: textKey === "register.google" ? "signup_with" : "signin_with",
                        shape: "rectangular"
                    }
                );
            }
        };

        const google = (window as any).google;
        if (google?.accounts?.id) {
            initGoogleSignIn();
        } else {
            const timer = setInterval(() => {
                const innerGoogle = (window as any).google;
                if (innerGoogle?.accounts?.id) {
                    initGoogleSignIn();
                    clearInterval(timer);
                }
            }, 100);
            return () => clearInterval(timer);
        }
    }, [textKey, role, resolvedTheme]);

    const handleCredentialResponse = async (response: any) => {
        try {
            const idToken = response.credential;

            if (onGoogleSelect) {
                const decoded = decodeGoogleToken(idToken);
                if (decoded) {
                    onGoogleSelect({
                        email: decoded.email || "",
                        fullName: decoded.name || ""
                    });
                } else {
                    toast.error(t("common.error"), {
                        description: t("login.googleDecodeError"),
                    });
                }
                return;
            }

            const apiResponse = await authService.googleLogin(idToken, role);
            
            if (apiResponse.data && apiResponse.data.exists === false) {
                toast.info(t("login.googleUserNotFound"), {
                    description: t("login.googleRedirectRegister"),
                });
                navigate("/register", {
                    state: {
                        email: apiResponse.data.email,
                        fullName: apiResponse.data.fullName
                    }
                });
                return;
            }

            const { token, user } = apiResponse.data;
            login(user, token);
            
            toast.success(t("common.success"), {
                description: `${t("login.welcome")}, ${user.fullName}!`,
            });
            navigate("/");
        } catch (error: any) {
            const message = error.response?.data?.message || t("common.error");
            toast.error(t("common.error"), {
                description: message,
            });
        }
    };

    return (
        <div className="flex justify-center w-full mt-2">
            <div id="googleButtonDiv" className="w-full max-w-xs"></div>
        </div>
    );
}
