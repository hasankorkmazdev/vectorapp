import { useState, useEffect } from "react";
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

import { useNavigate, Link, useLocation } from "react-router-dom";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/languageSwitcher/Index";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { RecaptchaWidget } from "@/components/RecaptchaWidget";

const getPasswordStrength = (pass: string): number => {
    if (!pass) return 0;
    if (pass.length < 8) return 0;

    const criteriaCount = [
        /[A-Z]/.test(pass),
        /[a-z]/.test(pass),
        /[0-9]/.test(pass),
        /[^A-Za-z0-9]/.test(pass)
    ].filter(Boolean).length;
    
    if (criteriaCount <= 1) return 1;
    if (criteriaCount === 2) return 2;
    if (criteriaCount === 3) return 3;
    return 4;
};

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    useDocumentTitle("register.title");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const formSchema = z.object({
        fullName: z.string().min(1, { message: t("validation.required") }),
        email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email") }),
        password: z.string().min(8, { message: t("validation.passwordLength") }),
        passwordConfirm: z.string().min(1, { message: t("validation.required") }),
        captchaToken: z.string().min(1, { message: t("register.captchaRequired") }),
    }).refine((data) => data.password === data.passwordConfirm, {
        message: t("validation.passwordMismatch"),
        path: ["passwordConfirm"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            passwordConfirm: "",
            captchaToken: "",
        },
    });

    const passwordValue = form.watch("password") || "";

    const [captchaResetKey, setCaptchaResetKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isGoogleRegistration, setIsGoogleRegistration] = useState(false);

    useEffect(() => {
        if (location.state && typeof location.state === "object") {
            const state = location.state as { email?: string; fullName?: string };
            if (state.email) {
                form.setValue("email", state.email);
            }
            if (state.fullName) {
                form.setValue("fullName", state.fullName);
            }
            if (state.email || state.fullName) {
                setIsGoogleRegistration(true);
            }
        }
    }, [location.state, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await authService.register({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                passwordConfirm: values.passwordConfirm,
                captchaToken: values.captchaToken
            });
            navigate("/verify-email", { state: { email: values.email } });
        } catch (error: any) {
            const serverMessage = error.response?.data?.message || t("register.error");
            toast.error(t("common.error"), {
                description: serverMessage,
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
                        <div className="flex items-center gap-2 justify-center mb-2">
                            <img
                                src="/media/logo/logo-dark.png"
                                alt={t("common.logoAlt")}
                                className="h-10 block dark:hidden"
                            />
                            <img
                                src="/media/logo/logo-light.png"
                                alt={t("common.logoAlt")}
                                className="h-10 hidden dark:block"
                            />
                        </div>
                        {t("register.title")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("register.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col gap-4">
                            
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("register.fullName")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("register.fullNameDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("register.email")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t("register.emailPlaceholder")}
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("register.emailDescription")}
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
                                        <FormLabel>{t("register.password")}</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("register.passwordDescription")}
                                        </FormDescription>
                                        
                                        {passwordValue && (
                                            <div className="flex flex-col gap-1.5 mt-1 mb-2">
                                                <div className="flex gap-1 h-1">
                                                    {[1, 2, 3, 4].map((index) => {
                                                        const strength = getPasswordStrength(passwordValue);
                                                        let barColor = "bg-muted";
                                                        if (strength >= index) {
                                                            if (strength === 1) barColor = "bg-red-500";
                                                            else if (strength === 2) barColor = "bg-amber-500";
                                                            else if (strength === 3) barColor = "bg-emerald-500/70";
                                                            else if (strength === 4) barColor = "bg-emerald-500";
                                                        }
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={cn("h-full flex-1 rounded-full transition-all duration-300", barColor)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {t("register.passwordStrength", {
                                                        strength: t(
                                                            getPasswordStrength(passwordValue) === 0
                                                                ? "register.passwordStrengthVeryWeak"
                                                                : getPasswordStrength(passwordValue) === 1
                                                                ? "register.passwordStrengthWeak"
                                                                : getPasswordStrength(passwordValue) === 2
                                                                ? "register.passwordStrengthMedium"
                                                                : getPasswordStrength(passwordValue) === 3
                                                                ? "register.passwordStrengthStrong"
                                                                : "register.passwordStrengthVeryStrong"
                                                        )
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passwordConfirm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("register.passwordConfirm")}</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("register.passwordConfirmDescription")}
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
                                            <div className="flex flex-col items-center">
                                                <RecaptchaWidget 
                                                    onVerify={(token) => form.setValue("captchaToken", token || "", { shouldValidate: true })} 
                                                    resetKey={captchaResetKey} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-center" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-2 mt-2">
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? t("common.ellipsis") : t("register.submit")}
                                </Button>
                                
                                {!isGoogleRegistration && (
                                    <GoogleLoginButton 
                                        role="Respondent" 
                                        textKey="register.google" 
                                        onGoogleSelect={(data) => {
                                            form.setValue("email", data.email);
                                            form.setValue("fullName", data.fullName);
                                            setIsGoogleRegistration(true);
                                        }}
                                    />
                                )}

                                <div className="text-center mt-4">
                                    <span className="text-sm text-muted-foreground">
                                        {t("register.haveAccount")}{" "}
                                    </span>
                                    <Link to="/login" className="underline text-sm font-semibold">
                                        {t("register.login")}
                                    </Link>
                                    <div className="flex justify-between mt-10 items-center">
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
