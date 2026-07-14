import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, Landmark, Phone, Mail, Pencil, XCircle, CheckCircle } from "lucide-react";
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
import { TagInput } from "@/components/tag-input";
import { customerService } from "@/features/customers/services/customer-service";
import type { CustomerContact, CustomerAddress } from "@/features/customers/types";
import { ContactsTab } from "./ContactsTab";
import { AddressesTab } from "./AddressesTab";
import { ProductsTab } from "./ProductsTab";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customerId?: string;
}

export function CustomerDialog({ open, onOpenChange, onSuccess, customerId }: CustomerDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!customerId;
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

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
    setTab("general");
  }, [form]);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    setFetching(true);
    try {
      const res = await customerService.getById(customerId);
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
    } catch {
      toast.error(t("common.error"));
    } finally {
      setFetching(false);
    }
  }, [customerId, form, t]);

  useEffect(() => {
    if (open) {
      resetAll();
      if (isEdit) fetchCustomer();
    }
  }, [open, isEdit, resetAll, fetchCustomer]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (isEdit) {
        const res = await customerService.update(customerId!, values);
        if (res.data.error) {
          toast.error(t("common.error"), { description: res.data.message || t("common.error") });
          return;
        }
        toast.success(t("common.success"), { description: t("customers.updateSuccess") });
      } else {
        const res = await customerService.create(values);
        const customer = res.data.data;

        for (const contact of contacts) {
          await customerService.createContact(customer.id, {
            fullName: contact.fullName,
            title: contact.title ?? undefined,
            email: contact.email ?? undefined,
            phone: contact.phone ?? undefined,
            gsm: contact.gsm ?? undefined,
            isPrimary: contact.isPrimary,
          });
        }

        for (const address of addresses) {
          await customerService.createAddress(customer.id, {
            label: address.label,
            country: address.country ?? undefined,
            city: address.city ?? undefined,
            district: address.district ?? undefined,
            postalCode: address.postalCode ?? undefined,
            address: address.address ?? undefined,
            isPrimary: address.isPrimary,
          });
        }

        toast.success(t("common.success"), { description: t("customers.createSuccess") });
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
            {isEdit ? t("customers.editTitle") : t("customers.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("customers.editDescription") : t("customers.createDescription")}
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
                  <TabsTrigger value="general">{t("customers.tabGeneral")}</TabsTrigger>
                  <TabsTrigger value="contacts">{t("customers.tabContacts")}</TabsTrigger>
                  <TabsTrigger value="addresses">{t("customers.tabAddresses")}</TabsTrigger>
                  <TabsTrigger value="products">{t("customers.tabProducts")}</TabsTrigger>
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
                          <FormLabel required>{t("customers.companyName")}</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon align="inline-start"><Building2 className="h-4 w-4" /></InputGroupAddon>
                              <InputGroupInput placeholder={t("customers.companyNamePlaceholder")} {...field} />
                            </InputGroup>
                          </FormControl>
                          <FormDescription>{t("customers.companyNameDescription")}</FormDescription>
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
                            <FormLabel>{t("customers.taxNumber")}</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon align="inline-start"><FileText className="h-4 w-4" /></InputGroupAddon>
                                <InputGroupInput
                                  placeholder={t("customers.taxNumberPlaceholder")}
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
                            <FormDescription>{t("customers.taxNumberDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxOffice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("customers.taxOffice")}</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon align="inline-start"><Landmark className="h-4 w-4" /></InputGroupAddon>
                                <InputGroupInput placeholder={t("customers.taxOfficePlaceholder")} {...field} />
                              </InputGroup>
                            </FormControl>
                            <FormDescription>{t("customers.taxOfficeDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <TagInput
                      label={t("customers.phone")}
                      placeholder={t("customers.phonePlaceholder")}
                      description={t("customers.phoneDescription")}
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
                      label={t("customers.email")}
                      placeholder={t("customers.emailPlaceholder")}
                      description={t("customers.emailDescription")}
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
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="contacts" className="flex-1 overflow-y-auto px-6 py-4 m-0">
                <ContactsTab
                  customerId={customerId}
                  contacts={contacts}
                  onContactsChange={setContacts}
                />
              </TabsContent>

              <TabsContent value="addresses" className="flex-1 overflow-y-auto px-6 py-4 m-0">
                <AddressesTab
                  customerId={customerId}
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
