import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authService } from "@/features/auth/services/auth-service";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { LanguageSwitcher } from "@/components/languageSwitcher/Index";

export function VerifyEmailPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    useDocumentTitle("verifyEmail.title");
    const { t } = useTranslation();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const urlEmail = searchParams.get("email");
    const urlToken = searchParams.get("token");
    const stateEmail = (location.state as { email?: string })?.email ?? "";
    const email = urlEmail || stateEmail;

    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [verifying, setVerifying] = useState(!!urlToken);
    const [verified, setVerified] = useState(false);
    const [verifyError, setVerifyError] = useState("");

    function renderStatus() {
      if (verifying) {
        return <p className="text-sm text-center text-muted-foreground">{t("common.loading")}</p>;
      }
      if (verified) {
        return <p className="text-sm text-center text-green-500 font-medium">{t("verifyEmail.emailVerified")}</p>;
      }
      if (verifyError) {
        return <p className="text-sm text-center text-red-500 font-medium">{verifyError}</p>;
      }
      return <p className="text-sm text-muted-foreground text-center">{t("verifyEmail.hint")}</p>;
    }

    useEffect(() => {
        if (urlEmail && urlToken) {
            setVerifying(true);
            authService.verifyEmail(urlEmail, urlToken)
                .then(() => {
                    setVerified(true);
                    toast.success(t("common.success"), {
                        description: t("verifyEmail.emailVerified"),
                    });
                })
                .catch((error: any) => {
                    setVerifyError(error.response?.data?.message || t("common.error"));
                    toast.error(t("common.error"), {
                        description: error.response?.data?.message || t("common.error"),
                    });
                })
                .finally(() => {
                    setVerifying(false);
                });
        }
    }, [urlEmail, urlToken, t]);

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        try {
            await authService.resendVerification(email);
            setResent(true);
            toast.success(t("common.success"), {
                description: t("verifyEmail.resendSuccess"),
            });
        } catch {
            toast.error(t("common.error"), {
                description: t("verifyEmail.resendError"),
            });
        } finally {
            setResending(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-8 h-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-center">{t("verifyEmail.title")}</CardTitle>
                    <CardDescription className="text-center">
                        {t("verifyEmail.description")}{" "}
                        {email && (
                            <span className="font-semibold text-foreground">{email}</span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {renderStatus()}

                        {email && !verified && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleResend}
                                disabled={resending || resent || verifying}
                                id="resend-verification-btn"
                            >
                                {resending ? t("common.ellipsis") : resent ? t("common.checkmark") : t("verifyEmail.resend")}
                            </Button>
                        )}

                        <Link to="/login" className="w-full">
                            <Button variant="ghost" className="w-full" id="back-to-login-btn">
                                {t("verifyEmail.backToLogin")}
                            </Button>
                        </Link>

                        <div className="flex justify-end mt-2">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
