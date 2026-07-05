import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Building2, FileText, Landmark, Phone, Mail, Users, MapPin, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { customerService, type Customer, type CustomerContact, type CustomerAddress } from "@/features/customers/services/customer-service";
import { ManageContactsDialog } from "@/features/customers/components/ManageContactsDialog";
import { ManageAddressesDialog } from "@/features/customers/components/ManageAddressesDialog";

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCustomerDialog({ open, onOpenChange, onSuccess }: CreateCustomerDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [pendingContacts, setPendingContacts] = useState<CustomerContact[]>([]);
  const [pendingAddresses, setPendingAddresses] = useState<CustomerAddress[]>([]);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [addressesOpen, setAddressesOpen] = useState(false);

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
    defaultValues: {
      companyName: "",
      taxNumber: "",
      taxOffice: "",
      phone: [],
      email: [],
    },
  });

  const resetAll = () => {
    form.reset();
    setCreatedCustomer(null);
    setPendingContacts([]);
    setPendingAddresses([]);
  };

  const handleContactsClick = () => {
    setContactsOpen(true);
  };

  const handleAddressesClick = () => {
    setAddressesOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await customerService.create(values);
      const customer = res.data.data;

      for (const contact of pendingContacts) {
        await customerService.createContact(customer.id, {
          fullName: contact.fullName,
          title: contact.title ?? undefined,
          email: contact.email ?? undefined,
          phone: contact.phone ?? undefined,
          gsm: contact.gsm ?? undefined,
          isPrimary: contact.isPrimary,
        });
      }

      for (const address of pendingAddresses) {
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

      toast.success(t("common.success"), {
        description: t("customers.createSuccess"),
      });
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

  const effectiveContacts = createdCustomer?.contacts ?? pendingContacts;
  const effectiveAddresses = createdCustomer?.addresses ?? pendingAddresses;
  const contactCount = effectiveContacts.length;
  const addressCount = effectiveAddresses.length;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) { resetAll(); onSuccess(); onOpenChange(false); } }}>
        <SheetContent className="sm:max-w-xl p-0 flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 shrink-0">
            <SheetTitle className="inline-flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("customers.createTitle")}
            </SheetTitle>
            <SheetDescription>{t("customers.createDescription")}</SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t("customers.companyName")}
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <Building2 className="h-4 w-4" />
                          </InputGroupAddon>
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
                            <InputGroupAddon align="inline-start">
                              <FileText className="h-4 w-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              placeholder={t("customers.taxNumberPlaceholder")}
                              {...field}
                              maxLength={11}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                                field.onChange(cleaned);
                              }}
                              onKeyDown={(e) => {
                                if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
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
                            <InputGroupAddon align="inline-start">
                              <Landmark className="h-4 w-4" />
                            </InputGroupAddon>
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

                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("customers.manageTitle")}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-1.5 text-sm font-medium leading-none">
                        <Users className="h-4 w-4" />
                        {t("customers.contacts")}
                      </label>
                      <button
                        type="button"
                        onClick={handleContactsClick}
                        className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-3 text-sm transition-colors hover:bg-accent cursor-pointer"
                      >
                        <span className="font-medium">
                          {contactCount > 0 ? `${contactCount} yetkili` : "0 yetkili"}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-1.5 text-sm font-medium leading-none">
                        <MapPin className="h-4 w-4" />
                        {t("customers.addresses")}
                      </label>
                      <button
                        type="button"
                        onClick={handleAddressesClick}
                        className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-3 text-sm transition-colors hover:bg-accent cursor-pointer"
                      >
                        <span className="font-medium">
                          {addressCount > 0 ? `${addressCount} adres` : "0 adres"}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="flex-row gap-2 shrink-0 border-t px-6 py-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  <XCircle className="h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={loading}>
                  <CheckCircle className="h-4 w-4" />
                  {loading ? t("common.ellipsis") : t("common.save")}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <ManageContactsDialog
        open={contactsOpen}
        onOpenChange={setContactsOpen}
        customerId={createdCustomer?.id ?? ""}
        initialContacts={effectiveContacts}
        onContactsChange={createdCustomer
          ? (c) => setCreatedCustomer((prev) => prev ? { ...prev, contacts: c } : prev)
          : setPendingContacts
        }
      />

      <ManageAddressesDialog
        open={addressesOpen}
        onOpenChange={setAddressesOpen}
        customerId={createdCustomer?.id ?? ""}
        initialAddresses={effectiveAddresses}
        onAddressesChange={createdCustomer
          ? (a) => setCreatedCustomer((prev) => prev ? { ...prev, addresses: a } : prev)
          : setPendingAddresses
        }
      />
    </>
  );
}
