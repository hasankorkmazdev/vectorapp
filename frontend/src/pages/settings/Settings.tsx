import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/api/axios";
import { toast } from "sonner";
import { Settings as SettingsIcon, Globe, CircleDollarSign } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface SettingsResponse {
  supportedLanguages: string[];
  defaultLanguage: string;
  priceVariesByLanguage: boolean;
  languageCurrencies: Record<string, string>;
}

import { AVAILABLE_LANGUAGES, LANG_NAMES, getDefaultCurrency, currencyOptions } from "@/lib/language-utils";
import { useAppStore } from "@/store/app-store";

export function SettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const getLangInfo = useAppStore((state) => state.getLangInfo);

  const formSchema = z
    .object({
      supportedLanguages: z
        .array(z.string())
        .min(1, { message: t("settings.validation.activeLangsRequired") }),
      defaultLanguage: z.string().min(1),
      priceVariesByLanguage: z.boolean(),
      currencies: z.record(z.string(), z.string()),
    })
    .refine((data) => data.supportedLanguages.includes(data.defaultLanguage), {
      message: t("settings.validation.defaultLangMustBeActive"),
      path: ["defaultLanguage"],
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supportedLanguages: ["tr"],
      defaultLanguage: "tr",
      priceVariesByLanguage: false,
      currencies: { tr: "TRY", en: "USD" },
    },
  });

  const { watch, setValue, trigger } = form;
  const activeLangs = watch("supportedLanguages") || [];
  const defaultLang = watch("defaultLanguage");
  const priceVaries = watch("priceVariesByLanguage");

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Sync default language when active languages change
  useEffect(() => {
    if (activeLangs.length > 0 && !activeLangs.includes(defaultLang)) {
      setValue("defaultLanguage", activeLangs[0]);
    }
  }, [activeLangs, defaultLang, setValue]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/organization/settings");
      const data = response.data.data as SettingsResponse;

      const formattedCurrencies: Record<string, string> = {};
      
      AVAILABLE_LANGUAGES.forEach((lang) => {
        if (data.languageCurrencies && data.languageCurrencies[lang.code]) {
          formattedCurrencies[lang.code] = data.languageCurrencies[lang.code];
        } else {
          formattedCurrencies[lang.code] = getDefaultCurrency(lang.code);
        }
      });

      form.reset({
        supportedLanguages: data.supportedLanguages,
        defaultLanguage: data.defaultLanguage,
        priceVariesByLanguage: data.priceVariesByLanguage ?? false,
        currencies: formattedCurrencies,
      });
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const langCurrencies: Record<string, string> = {};
      if (values.priceVariesByLanguage) {
        values.supportedLanguages.forEach((lang) => {
          langCurrencies[lang] = values.currencies[lang] || getDefaultCurrency(lang);
        });
      } else {
        const commonCurrency = values.currencies[values.defaultLanguage] || getDefaultCurrency(values.defaultLanguage);
        values.supportedLanguages.forEach((lang) => {
          langCurrencies[lang] = commonCurrency;
        });
      }

      await api.put("/organization/settings", {
        supportedLanguages: values.supportedLanguages,
        defaultLanguage: values.defaultLanguage,
        priceVariesByLanguage: values.priceVariesByLanguage,
        languageCurrencies: langCurrencies,
      });

      toast.success(t("settings.saveSuccess"));
      await fetchSettings();
    } catch (error: any) {
      toast.error(t("settings.saveError"), {
        description: error.response?.data?.message || t("settings.saveError"),
      });
    } finally {
      setSaving(false);
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
    
    // Trigger validation on default language in case it becomes invalid
    trigger("defaultLanguage");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("settings.description")}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card 1: Language Settings */}
          <Card className="border-muted/50 bg-background/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded text-blue-500">
                <Globe className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold">
                  {t("settings.languagesCardTitle")}
                </CardTitle>
                <CardDescription>
                  {t("settings.languagesCardDesc")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Languages Switches */}
              <FormField
                control={form.control}
                name="supportedLanguages"
                render={() => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t("settings.activeLangsLabel")}</FormLabel>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {AVAILABLE_LANGUAGES.map((lang) => {
                        const isChecked = activeLangs.includes(lang.code);
                        const info = getLangInfo(lang.code);
                        return (
                          <div
                            key={lang.code}
                            className="flex items-center justify-between rounded-lg border p-4 bg-card/30"
                          >
                            <div className="space-y-0.5">
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
                      {t("settings.activeLangsDesc")}
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
                  <FormItem className="max-w-md">
                    <FormLabel>{t("settings.defaultLangLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={activeLangs.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("settings.defaultLangLabel")} />
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
                      {t("settings.defaultLangDesc")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card 2: Currency Settings */}
          {activeLangs.length > 0 && (
            <Card className="border-muted/50 bg-background/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-500">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-bold">
                    {t("settings.currencyCardTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.currencyCardDesc")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                {/* Price Varies By Language Toggle */}
                <FormField
                  control={form.control}
                  name="priceVariesByLanguage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card/30">
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

                {priceVaries ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {activeLangs.map((lang) => (
                      <FormField
                        key={lang}
                        control={form.control}
                        name={`currencies.${lang}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("settings.currencyLabel", {
                                lang: LANG_NAMES[lang] || lang.toUpperCase(),
                              })}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || getDefaultCurrency(lang)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("settings.currencyLabel")} />
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
                              {t("settings.currencyDesc", {
                                lang: LANG_NAMES[lang] || lang.toUpperCase(),
                              })}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name={`currencies.${defaultLang}` as any}
                    render={({ field }) => (
                      <FormItem className="max-w-md">
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
                    )}
                  </CardContent>
                </Card>
              )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={saving || !form.formState.isDirty}
              className="px-6"
            >
              {saving ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
