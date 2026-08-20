import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, Landmark, Phone, Mail, Pencil, XCircle, CheckCircle } from "lucide-react";
import { FieldDescription } from "@/components/field-description";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/tag-input";
import { TagSelector } from "@/features/account/components/TagSelector";
import { accountService } from "@/features/account/services/account-service";
import type { AccountContact, AccountAddress } from "@/features/account/types";
import { ContactsTab } from "./ContactsTab";
import { AddressesTab } from "./AddressesTab";
import { ProductsTab } from "./ProductsTab";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  accountId?: string;
}

export function AccountDialog({ open, onOpenChange, onSuccess, accountId }: AccountDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!accountId;
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [contacts, setContacts] = useState<AccountContact[]>([]);
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const phoneRegex = /^(?:\+?90|0)?\s*(?:\(?([2-5]\d{2})\)?)[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const formSchema = z.object({
    companyName: z.string().min(1, t("validation.required")),
    taxNumber: z.string().max(11).regex(/^\d*$/, t("validation.onlyDigits")).optional().or(z.literal("")),
    taxOffice: z.string().optional(),
    phone: z.array(z.string().regex(phoneRegex, t("validation.invalidPhone"))),
    email: z.array(z.string().regex(emailRegex, t("validation.invalidEmail"))),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: "", taxNumber: "", taxOffice: "", phone: [], email: [] },
  });

  const resetAll = useCallback(() => {
    form.reset();
    setContacts([]);
    setAddresses([]);
    setTagIds([]);
    setTab("general");
  }, [form]);

  const fetchAccount = useCallback(async () => {
    if (!accountId) return;
    setFetching(true);
    try {
      const res = await accountService.getById(accountId);
      const data = res.data.data;
      form.reset({
        companyName: data.companyName,
        taxNumber: data.taxNumber ?? "",
        taxOffice: data.taxOffice ?? "",
        phone: data.phone,
        email: data.email,
      });
      setContacts(data.contacts);
      setAddresses(data.addresses);
      setTagIds(data.tags.map((tag) => tag.id));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setFetching(false);
    }
  }, [accountId, form, t]);

  useEffect(() => {
    if (open) {
      resetAll();
      if (isEdit) fetchAccount();
    }
  }, [open, isEdit, resetAll, fetchAccount]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (isEdit) {
        const res = await accountService.update(accountId!, { ...values, tagIds });
        if (res.data.error) {
          toast.error(t("common.error"), { description: res.data.message || t("common.error") });
          return;
        }
        toast.success(t("common.success"), { description: t("accounts.updateSuccess") });
      } else {
        const res = await accountService.create({ ...values, tagIds });
        const account = res.data.data;

        for (const contact of contacts) {
          await accountService.createContact(account.id, {
            fullName: contact.fullName,
            title: contact.title ?? undefined,
            email: contact.email ?? undefined,
            phone: contact.phone ?? undefined,
            gsm: contact.gsm ?? undefined,
            isPrimary: contact.isPrimary,
          });
        }

        for (const address of addresses) {
          await accountService.createAddress(account.id, {
            label: address.label,
            country: address.country ?? undefined,
            city: address.city ?? undefined,
            district: address.district ?? undefined,
            postalCode: address.postalCode ?? undefined,
            address: address.address ?? undefined,
            isPrimary: address.isPrimary,
          });
        }

        toast.success(t("common.success"), { description: t("accounts.createSuccess") });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onOpenChange(false); } }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="inline-flex items-center gap-2">
            {isEdit ? <Pencil className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            {isEdit ? t("accounts.editTitle") : t("accounts.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("accounts.editDescription") : t("accounts.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 pt-4 shrink-0">
                <TabsList>
                  <TabsTrigger value="general">{t("accounts.tabGeneral")}</TabsTrigger>
                  <TabsTrigger value="contacts">{t("accounts.tabContacts")}</TabsTrigger>
                  <TabsTrigger value="addresses">{t("accounts.tabAddresses")}</TabsTrigger>
                  <TabsTrigger value="products">{t("accounts.tabProducts")}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general" className="flex-1 overflow-y-auto px-6 py-4 m-0">
                <Form {...form}>
                  <form noValidate autoComplete="off" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>{t("accounts.companyName")}</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon align="inline-start"><Building2 className="h-4 w-4" /></InputGroupAddon>
                              <InputGroupInput placeholder={t("accounts.companyNamePlaceholder")} {...field} />
                            </InputGroup>
                          </FormControl>
                          <FormDescription>{t("accounts.companyNameDescription")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="taxNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("accounts.taxNumber")}</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon align="inline-start"><FileText className="h-4 w-4" /></InputGroupAddon>
                                <InputGroupInput
                                  placeholder={t("accounts.taxNumberPlaceholder")}
                                  {...field}
                                  maxLength={11}
                                  onChange={(e) => {
                                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                                    field.onChange(cleaned);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
                                  }}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormDescription>{t("accounts.taxNumberDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxOffice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("accounts.taxOffice")}</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon align="inline-start"><Landmark className="h-4 w-4" /></InputGroupAddon>
                                <InputGroupInput placeholder={t("accounts.taxOfficePlaceholder")} {...field} />
                              </InputGroup>
                            </FormControl>
                            <FormDescription>{t("accounts.taxOfficeDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("accounts.tags")}</Label>
                      <TagSelector value={tagIds} onChange={setTagIds} />
                      <FieldDescription>{t("accounts.tagsDescription")}</FieldDescription>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <TagInput
                        label={t("accounts.phone")}
                        placeholder={t("accounts.phonePlaceholder")}
                        description={t("accounts.phoneDescription")}
                        icon={<Phone className="h-4 w-4" />}
                        values={form.watch("phone")}
                        onAdd={(items) => {
                          const current = form.getValues("phone");
                          form.setValue("phone", [...current, ...items]);
                        }}
                        onRemove={(index) => {
                          const current = form.getValues("phone");
                          form.setValue("phone", current.filter((_, i) => i !== index));
                        }}
                        regex={phoneRegex}
                        invalidMessage={t("validation.invalidPhone")}
                      />

                      <TagInput
                        label={t("accounts.email")}
                        placeholder={t("accounts.emailPlaceholder")}
                        description={t("accounts.emailDescription")}
                        icon={<Mail className="h-4 w-4" />}
                        values={form.watch("email")}
                        onAdd={(items) => {
                          const current = form.getValues("email");
                          form.setValue("email", [...current, ...items]);
                        }}
                        onRemove={(index) => {
                          const current = form.getValues("email");
                          form.setValue("email", current.filter((_, i) => i !== index));
                        }}
                        regex={emailRegex}
                        invalidMessage={t("validation.invalidEmail")}
                      />
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="contacts" className="flex-1 overflow-y-auto px-6 py-4 m-0">
                <ContactsTab
                  accountId={accountId}
                  contacts={contacts}
                  onContactsChange={setContacts}
                />
              </TabsContent>

              <TabsContent value="addresses" className="flex-1 overflow-y-auto px-6 py-4 m-0">
                <AddressesTab
                  accountId={accountId}
                  addresses={addresses}
                  onAddressesChange={setAddresses}
                />
              </TabsContent>

              <TabsContent value="products" className="flex-1 overflow-y-auto px-6 py-4 m-0">
                <ProductsTab />
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex-row gap-2 shrink-0 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <XCircle className="h-4 w-4" />
                {t("common.cancel")}
              </Button>
              <Button type="button" disabled={loading} onClick={form.handleSubmit(onSubmit)}>
                <CheckCircle className="h-4 w-4" />
                {loading ? t("common.ellipsis") : t("common.save")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
