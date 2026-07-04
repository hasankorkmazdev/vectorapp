import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useAppStore } from "@/store/app-store";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/languageSwitcher/Index";
import { Logo } from "@/components/logo";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { authService } from "@/features/auth/services/auth-service";
import { RecaptchaWidget } from "@/components/RecaptchaWidget";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    useDocumentTitle("login.title");
    const { t } = useTranslation();
    const isCaptchaEnabled = import.meta.env.VITE_RECAPTCHA_ENABLED === "true";
    
    const formSchema = z.object({
        email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email") }),
        password: z.string().min(1, { message: t("validation.required") }),
        captchaToken: isCaptchaEnabled
            ? z.string().min(1, { message: t("login.captchaRequired") })
            : z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "hasankorkmazdev@gmail.com",
            password: "1302197342",
            captchaToken: "",
        },
    });

    const [captchaResetKey, setCaptchaResetKey] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const login = useAppStore((state) => state.login);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const submitRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            toast.success(t("common.success"), {
                description: t("verifyEmail.emailVerified"),
            });
        }
    }, [searchParams, t]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const response = await authService.login(values.email, values.password, values.captchaToken);
            const { token, user } = response.data;

            login(user, token);

            toast.success(t("common.success"), {
                description: `${t("login.welcome")}, ${user.fullName}!`,
            });
            navigate("/");
        } catch (error: any) {
            const message = error.response?.data?.message || t("login.error");
            toast.error(t("common.error"), {
                description: message,
            });
            form.setValue("captchaToken", "");
            setCaptchaResetKey((k) => k + 1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Logo />
                        </div>
                        {t("login.title")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("login.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col gap-4">
                            
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("login.email")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t("login.emailPlaceholder")}
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("login.emailDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center">
                                            <FormLabel>{t("login.password")}</FormLabel>
                                            <Link
                                                to="/forgot-password"
                                                tabIndex={-1}
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                                {t("login.forgotPassword")}
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <PasswordInput
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("login.passwordDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="captchaToken"
                                render={() => (
                                    <FormItem className="my-2">
                                        <FormControl>
                                            <div className="flex flex-col items-center gap-2">
                                                <RecaptchaWidget 
                                                    onVerify={(token) => form.setValue("captchaToken", token || "", { shouldValidate: true })} 
                                                    resetKey={captchaResetKey} 
                                                />
                                                {import.meta.env.DEV && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => form.setValue("captchaToken", "development_bypass", { shouldValidate: true })}
                                                        className="text-xs text-muted-foreground hover:text-foreground"
                                                        id="bypass-captcha-btn"
                                                    >
                                                        {t("login.captchaBypass")}
                                                    </Button>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-center" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-2 mt-2">
                                <Button ref={submitRef} type="submit" disabled={loading} className="w-full">
                                    {loading ? t("common.ellipsis") : t("login.submit")}
                                </Button>

                                <GoogleLoginButton role="Respondent" textKey="login.google" />

                                <div className="text-center mt-4">
                                    <span className="text-sm text-muted-foreground">
                                        {t("login.noAccount")}{" "}
                                    </span>
                                    <Link to="/register" className="underline text-sm font-semibold">
                                        {t("login.signUp")}
                                    </Link>
                                    <div className="flex justify-between mt-20 gap-2">
                                        <div>
                                            <Button type="button" className="px-2" variant={"link"} asChild>
                                                <Link to="/about">{t("common.about")}</Link>
                                            </Button>
                                            <Button type="button" className="px-2" variant={"link"} asChild>
                                                <Link to="/terms">{t("common.terms")}</Link>
                                            </Button>
                                            <Button type="button" className="px-2" variant={"link"} asChild>
                                                <Link to="/privacy">{t("common.privacy")}</Link>
                                            </Button>
                                        </div>
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
