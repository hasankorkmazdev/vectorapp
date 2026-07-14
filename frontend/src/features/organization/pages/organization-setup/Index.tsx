import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAppStore } from "@/store/app-store";
import { api } from "@/api/axios";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { AVAILABLE_LANGUAGES, LANG_NAMES, getDefaultCurrency, currencyOptions } from "@/lib/language-utils";

export function OrganizationSetupPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const addOrganization = useAppStore((state) => state.addOrganization);
    const getLangInfo = useAppStore((state) => state.getLangInfo);

    const formSchema = z.object({
        name: z.string().min(3, { message: t("organizationSetup.validation.nameLength") }),
        taxOffice: z.string().min(1, { message: t("organizationSetup.validation.taxOfficeRequired") }),
        taxNumber: z.string()
            .length(10, { message: t("organizationSetup.validation.taxNumberLength") })
            .regex(/^\d+$/, { message: t("organizationSetup.validation.taxNumberDigits") }),
        address: z.string().min(1, { message: t("organizationSetup.validation.addressRequired") }),
        supportedLanguages: z.array(z.string()).min(1, { message: t("organizationSetup.validation.activeLangsRequired") }),
        defaultLanguage: z.string().min(1),
        priceVariesByLanguage: z.boolean(),
        currencies: z.record(z.string(), z.string())
    }).refine((data) => data.supportedLanguages.includes(data.defaultLanguage), {
        message: t("organizationSetup.validation.defaultLangMustBeActive"),
        path: ["defaultLanguage"],
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            taxOffice: "",
            taxNumber: "",
            address: "",
            supportedLanguages: ["tr"],
            defaultLanguage: "tr",
            priceVariesByLanguage: false,
            currencies: { tr: "TRY", en: "USD" }
        },
    });

    const { watch, setValue, trigger } = form;
    const activeLangs = watch("supportedLanguages") || [];
    const defaultLang = watch("defaultLanguage");
    const priceVaries = watch("priceVariesByLanguage");

    // Sync default language when active languages change
    useEffect(() => {
        if (activeLangs.length > 0 && !activeLangs.includes(defaultLang)) {
            setValue("defaultLanguage", activeLangs[0]);
        }
    }, [activeLangs, defaultLang, setValue]);

    const [loading, setLoading] = useState(false);

    function renderCurrencies() {
      if (priceVaries) {
        return (
          <div className="grid gap-4 sm:grid-cols-2 text-left">
            {activeLangs.map((lang) => (
              <FormField
                key={lang}
                control={form.control}
                name={`currencies.${lang}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("organizationSetup.currencyLabel", {
                        lang: LANG_NAMES[lang] || lang.toUpperCase(),
                      })}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || getDefaultCurrency(lang)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("organizationSetup.singleCurrencyLabel")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("organizationSetup.currencyDescription", {
                        lang: LANG_NAMES[lang] || lang.toUpperCase(),
                      })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        );
      }
      return (
        <FormField
          control={form.control}
          name={`currencies.${defaultLang}` as any}
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>
                {t("organizationSetup.singleCurrencyLabel")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || getDefaultCurrency(defaultLang)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("organizationSetup.singleCurrencyLabel")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencyOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("organizationSetup.singleCurrencyDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            // Build currency settings dictionary
            const langCurrencies: Record<string, string> = {};
            if (values.priceVariesByLanguage) {
                values.supportedLanguages.forEach((lang) => {
                    langCurrencies[lang] = values.currencies[lang] || getDefaultCurrency(lang);
                });
            } else {
                // If price doesn't vary, use the currency of the default language for all active languages
                const commonCurrency = values.currencies[values.defaultLanguage] || getDefaultCurrency(values.defaultLanguage);
                values.supportedLanguages.forEach((lang) => {
                    langCurrencies[lang] = commonCurrency;
                });
            }

            const response = await api.post("/organization/setup", {
                name: values.name.trim(),
                taxOffice: values.taxOffice.trim(),
                taxNumber: values.taxNumber.trim(),
                address: values.address.trim(),
                supportedLanguages: values.supportedLanguages,
                defaultLanguage: values.defaultLanguage,
                priceVariesByLanguage: values.priceVariesByLanguage,
                languageCurrencies: langCurrencies
            });

            const { organizationId } = response.data.data;

            addOrganization({ id: organizationId, name: values.name.trim(), role: "Owner", isSetupRequired: false });

            toast.success(t("common.success"), {
                description: t("organizationSetup.success"),
            });

            navigate("/");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t("common.error");
            toast.error(t("common.error"), {
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageToggle = (langCode: string, checked: boolean) => {
        let currentLangs = [...activeLangs];
        if (checked) {
            if (!currentLangs.includes(langCode)) {
                currentLangs.push(langCode);
            }
        } else {
            currentLangs = currentLangs.filter((code) => code !== langCode);
        }

        setValue("supportedLanguages", currentLangs, {
            shouldValidate: true,
            shouldDirty: true,
        });
        
        trigger("defaultLanguage");
    };

    return (
        <div className="w-full max-w-md animate-in fade-in duration-500">
            <Card className="shadow-lg border-muted/50 backdrop-blur-sm bg-background/95">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">
                        {t("organizationSetup.title")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("organizationSetup.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
                            
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("organizationSetup.name")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t("organizationSetup.namePlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("organizationSetup.nameDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxOffice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("organizationSetup.taxOffice")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t("organizationSetup.taxOfficePlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("organizationSetup.taxOfficeDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("organizationSetup.taxNumber")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                maxLength={10}
                                                placeholder={t("organizationSetup.taxNumberPlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("organizationSetup.taxNumberDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                 control={form.control}
                                 name="address"
                                 render={({ field }) => (
                                     <FormItem>
                                         <FormLabel>{t("organizationSetup.address")}</FormLabel>
                                         <FormControl>
                                             <Textarea
                                                 rows={4}
                                                 placeholder={t("organizationSetup.addressPlaceholder")}
                                                 {...field}
                                             />
                                         </FormControl>
                                         <FormDescription>
                                             {t("organizationSetup.addressDescription")}
                                         </FormDescription>
                                         <FormMessage />
                                     </FormItem>
                                 )}
                             />

                            {/* Supported Languages */}
                            <FormField
                                control={form.control}
                                name="supportedLanguages"
                                render={() => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>{t("organizationSetup.supportedLanguages")}</FormLabel>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {AVAILABLE_LANGUAGES.map((lang) => {
                                                const isChecked = activeLangs.includes(lang.code);
                                                const info = getLangInfo(lang.code);
                                                return (
                                                    <div
                                                        key={lang.code}
                                                        className="flex items-center justify-between rounded-lg border p-3 bg-card/30"
                                                    >
                                                        <div className="space-y-0.5 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <img src={info.flag} alt={info.name} className="w-4 h-3 object-cover shrink-0" />
                                                                <Label className="text-sm font-medium">
                                                                    {lang.label}
                                                                </Label>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {lang.code.toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) =>
                                                                    handleLanguageToggle(lang.code, checked)
                                                                }
                                                            />
                                                        </FormControl>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <FormDescription>
                                            {t("organizationSetup.supportedLanguagesDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Default Language Selector */}
                            <FormField
                                control={form.control}
                                name="defaultLanguage"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                        <FormLabel>{t("organizationSetup.defaultLanguage")}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={activeLangs.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("organizationSetup.defaultLanguage")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {AVAILABLE_LANGUAGES.filter((lang) =>
                                                    activeLangs.includes(lang.code)
                                                ).map((lang) => {
                                                    const info = getLangInfo(lang.code);
                                                    return (
                                                        <SelectItem key={lang.code} value={lang.code}>
                                                            <span className="flex items-center gap-2">
                                                                <img src={info.flag} alt={info.name} className="w-4 h-3 object-cover shrink-0" />
                                                                {lang.label}
                                                            </span>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {t("organizationSetup.defaultLanguageDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price Varies By Language Toggle */}
                            <FormField
                                control={form.control}
                                name="priceVariesByLanguage"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card/30 text-left">
                                        <div className="space-y-0.5 max-w-[80%]">
                                            <FormLabel className="text-sm font-medium">
                                                {t("organizationSetup.priceVariesByLanguage")}
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                {t("organizationSetup.priceVariesByLanguageDescription")}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Currencies Selection */}
                            {renderCurrencies()}

                             <Button type="submit" className="w-full mt-2" disabled={loading}>
                                 {loading ? t("common.loading") : t("organizationSetup.submit")}
                             </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
