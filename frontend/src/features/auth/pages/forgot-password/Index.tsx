import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { authService } from "@/features/auth/services/auth-service";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Logo } from "@/components/logo";
import { RecaptchaWidget } from "@/components/RecaptchaWidget";

export default function ForgotPasswordPage() {
    useDocumentTitle("forgotPassword.title");
    const { t } = useTranslation();
    const isCaptchaEnabled = import.meta.env.VITE_RECAPTCHA_ENABLED === "true";

    const formSchema = z.object({
        email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email") }),
        captchaToken: isCaptchaEnabled
            ? z.string().min(1, { message: t("forgotPassword.captchaRequired") })
            : z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            captchaToken: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [captchaResetKey, setCaptchaResetKey] = useState(0);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await authService.forgotPassword(values.email, values.captchaToken);
            setSuccess(true);
            toast.success(t("common.success"), {
                description: t("forgotPassword.successDescription"),
            });
        } catch (error: any) {
            const message = error.response?.data?.message || t("forgotPassword.error");
            toast.error(t("common.error"), {
                description: message,
            });
            form.setValue("captchaToken", "");
            setCaptchaResetKey((k) => k + 1);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col gap-6 max-w-md mx-auto mt-20">
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
                        <CardTitle className="text-center">{t("forgotPassword.successTitle")}</CardTitle>
                        <CardDescription className="text-center">
                            {t("forgotPassword.successDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground text-center">
                                {t("forgotPassword.successHint")}
                            </p>
                            <Link to="/login" className="w-full">
                                <Button variant="ghost" className="w-full">
                                    {t("forgotPassword.backToLogin")}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto mt-20">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Logo />
                        </div>
                        {t("forgotPassword.title")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("forgotPassword.description")}
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
                                        <FormLabel>{t("forgotPassword.email")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t("forgotPassword.emailPlaceholder")}
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("forgotPassword.emailDescription")}
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
                                    {loading ? t("common.ellipsis") : t("forgotPassword.submit")}
                                </Button>
                                <Link to="/login" className="w-full text-center text-sm underline mt-2">
                                    {t("forgotPassword.backToLogin")}
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
