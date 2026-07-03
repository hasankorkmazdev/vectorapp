import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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

import { authService } from "@/services/auth-service";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function ResetPasswordPage() {
    useDocumentTitle("resetPassword.title");
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const formSchema = z.object({
        password: z.string().min(8, { message: t("validation.passwordLength") }),
        confirmPassword: z.string().min(1, { message: t("validation.required") }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("validation.passwordMismatch"),
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!email || !token) {
            toast.error(t("common.error"), {
                description: t("resetPassword.missingToken"),
            });
        }
    }, [email, token, t]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!email || !token) {
            toast.error(t("common.error"), {
                description: t("resetPassword.missingToken"),
            });
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({
                email,
                token,
                newPassword: values.password
            });
            setSuccess(true);
            toast.success(t("common.success"), {
                description: t("resetPassword.successDescription"),
            });
        } catch (error: any) {
            const message = error.response?.data?.message || t("resetPassword.error");
            toast.error(t("common.error"), {
                description: message,
            });
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
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <CardTitle className="text-center">{t("resetPassword.successTitle")}</CardTitle>
                        <CardDescription className="text-center">
                            {t("resetPassword.successDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground text-center">
                                {t("resetPassword.successHint")}
                            </p>
                            <Button 
                                onClick={() => navigate("/login")}
                                className="w-full"
                            >
                                {t("resetPassword.backToLogin")}
                            </Button>
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
                        {t("resetPassword.title")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("resetPassword.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col gap-4">
                            
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("resetPassword.password")}</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                placeholder={t("resetPassword.passwordPlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("resetPassword.passwordDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("resetPassword.passwordConfirm")}</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                placeholder={t("resetPassword.passwordPlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("resetPassword.passwordConfirmDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-2 mt-4">
                                <Button type="submit" disabled={loading || !email || !token} className="w-full">
                                    {loading ? t("common.ellipsis") : t("resetPassword.submit")}
                                </Button>
                                <Link to="/login" className="w-full text-center text-sm underline mt-2">
                                    {t("resetPassword.backToLogin")}
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
