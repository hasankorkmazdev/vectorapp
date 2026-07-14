import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, User, Briefcase, Mail, Phone, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { customerService } from "@/features/customers/services/customer-service";
import type { CustomerContact, CreateContactData } from "@/features/customers/types";

interface ContactsTabProps {
  customerId?: string;
  contacts: CustomerContact[];
  onContactsChange: (contacts: CustomerContact[]) => void;
}

const phoneRegex = /^(?:\+?90|0)?\s*(?:\(?([2-5]\d{2})\)?)[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function ContactsTab({ customerId, contacts, onContactsChange }: ContactsTabProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formSchema = z.object({
    fullName: z.string().min(1, t("validation.required")),
    title: z.string().optional(),
    email: z.string().regex(emailRegex, t("validation.invalidEmail")).optional().or(z.literal("")),
    phone: z.string().regex(phoneRegex, t("validation.invalidPhone")).optional().or(z.literal("")),
    isPrimary: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", title: "", email: "", phone: "", isPrimary: false },
  });

  const resetForm = () => {
    form.reset({ fullName: "", title: "", email: "", phone: "", isPrimary: false });
    setEditingId(null);
  };

  const startEdit = (contact: CustomerContact) => {
    form.reset({
      fullName: contact.fullName,
      title: contact.title ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      isPrimary: contact.isPrimary,
    });
    setEditingId(contact.id);
  };

  const updateContacts = (updater: CustomerContact[] | ((prev: CustomerContact[]) => CustomerContact[])) => {
    const next = typeof updater === "function" ? updater(contacts) : updater;
    onContactsChange(next);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const data: CreateContactData = {
        fullName: values.fullName,
        title: values.title || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        isPrimary: values.isPrimary,
      };

      if (customerId) {
        if (editingId) {
          const res = await customerService.updateContact(customerId, editingId, data);
          updateContacts((prev) => prev.map((c) => (c.id === editingId ? res.data.data : c)));
          toast.success(t("common.success"), { description: t("customers.contactUpdateSuccess") });
        } else {
          const res = await customerService.createContact(customerId, data);
          updateContacts((prev) => [...prev, res.data.data]);
          toast.success(t("common.success"), { description: t("customers.contactCreateSuccess") });
        }
      } else {
        if (editingId) {
          updateContacts((prev) => prev.map((c) => c.id === editingId ? { ...c, ...data, id: editingId } : c));
        } else {
          const newContact: CustomerContact = {
            id: crypto.randomUUID(),
            fullName: data.fullName,
            title: data.title ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            isPrimary: data.isPrimary ?? false,
          };
          updateContacts((prev) => [...prev, newContact]);
        }
      }
      resetForm();
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      if (customerId) {
        await customerService.deleteContact(customerId, deleteId);
        toast.success(t("common.success"), { description: t("customers.contactDeleteSuccess") });
      }
      updateContacts((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
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
              <Button type="button" variant="outline" onClick={resetForm}>{t("common.cancel")}</Button>
            )}
            <Button type="submit" disabled={loading} size="sm">
              {loading ? t("common.ellipsis") : (editingId ? t("common.save") : t("customers.addContact"))}
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="max-h-60 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("customers.contactFullName")}</TableHead>
              <TableHead>{t("customers.contactTitle")}</TableHead>
              <TableHead>{t("customers.contactPhone")}</TableHead>
              <TableHead>{t("customers.contactEmail")}</TableHead>
              <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                  {t("common.empty")}
                </TableCell>
              </TableRow>
            )}
            {contacts.map((contact) => (
              <TableRow key={contact.id} className="group">
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {contact.isPrimary && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                    {contact.fullName}
                  </span>
                </TableCell>
                <TableCell>{contact.title || "-"}</TableCell>
                <TableCell>{contact.phone || "-"}</TableCell>
                <TableCell>{contact.email || "-"}</TableCell>
                <TableCell>
                  <div className="invisible group-hover:visible flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(contact)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={deleteId === contact.id} onOpenChange={(v) => setDeleteId(v ? contact.id : null)}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("customers.deleteContact")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("customers.deleteContactConfirm")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>{t("common.delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
