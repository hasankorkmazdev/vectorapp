import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Briefcase, Phone, Mail, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const phoneRegex = /^(?:\+?90|0)?\s*(?:\(?([2-5]\d{2})\)?)[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface ContactFormSectionProps {
  editingId: string | null;
  loading: boolean;
  onSubmit: (values: z.infer<ReturnType<typeof getSchema>>) => Promise<void>;
  onReset: () => void;
}

function getSchema(t: (key: string) => string) {
  return z.object({
    fullName: z.string().min(1, t("validation.required")),
    title: z.string().optional(),
    email: z.string().regex(emailRegex, t("validation.invalidEmail")).optional().or(z.literal("")),
    phone: z.string().regex(phoneRegex, t("validation.invalidPhone")).optional().or(z.literal("")),
    isPrimary: z.boolean(),
  });
}

export function ContactFormSection({ editingId, loading, onSubmit, onReset }: ContactFormSectionProps) {
  const { t } = useTranslation();
  const form = useForm<z.infer<ReturnType<typeof getSchema>>>({
    resolver: zodResolver(getSchema(t)),
    defaultValues: { fullName: "", title: "", email: "", phone: "", isPrimary: false },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("customers.contactFullName")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><User className="h-4 w-4" /></InputGroupAddon>
                  <InputGroupInput placeholder={t("customers.contactFullNamePlaceholder")} {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("customers.contactFullNameDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.contactTitle")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><Briefcase className="h-4 w-4" /></InputGroupAddon>
                  <InputGroupInput placeholder={t("customers.contactTitlePlaceholder")} {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("customers.contactTitleDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.contactPhone")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><Phone className="h-4 w-4" /></InputGroupAddon>
                  <InputGroupInput placeholder={t("customers.contactPhonePlaceholder")} {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("customers.contactPhoneDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.contactEmail")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><Mail className="h-4 w-4" /></InputGroupAddon>
                  <InputGroupInput placeholder={t("customers.contactEmailPlaceholder")} {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("customers.contactEmailDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isPrimary" render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="mt-0 inline-flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              {t("customers.contactIsPrimary")}
            </FormLabel>
          </FormItem>
        )} />

        <div className="flex gap-2 justify-end">
          {editingId && (
            <Button type="button" variant="outline" onClick={onReset}>{t("common.cancel")}</Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? t("common.ellipsis") : (editingId ? t("common.save") : t("customers.addContact"))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
