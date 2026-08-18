import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Tag, Globe, Building2, Map, Mail, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  InputGroupTextarea,
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
import { accountService } from "@/features/account/services/account-service";
import type { AccountAddress, CreateAddressData } from "@/features/account/types";

interface AddressesTabProps {
  accountId?: string;
  addresses: AccountAddress[];
  onAddressesChange: (addresses: AccountAddress[]) => void;
}

export function AddressesTab({ accountId, addresses, onAddressesChange }: AddressesTabProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formSchema = z.object({
    label: z.string().min(1, t("validation.required")),
    country: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional(),
    isPrimary: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { label: "", country: "", city: "", district: "", postalCode: "", address: "", isPrimary: false },
  });

  const resetForm = () => {
    form.reset({ label: "", country: "", city: "", district: "", postalCode: "", address: "", isPrimary: false });
    setEditingId(null);
  };

  const startEdit = (address: AccountAddress) => {
    form.reset({
      label: address.label,
      country: address.country ?? "",
      city: address.city ?? "",
      district: address.district ?? "",
      postalCode: address.postalCode ?? "",
      address: address.address ?? "",
      isPrimary: address.isPrimary,
    });
    setEditingId(address.id);
  };

  const updateAddresses = (updater: AccountAddress[] | ((prev: AccountAddress[]) => AccountAddress[])) => {
    const next = typeof updater === "function" ? updater(addresses) : updater;
    onAddressesChange(next);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const data: CreateAddressData = {
        label: values.label,
        country: values.country || undefined,
        city: values.city || undefined,
        district: values.district || undefined,
        postalCode: values.postalCode || undefined,
        address: values.address || undefined,
        isPrimary: values.isPrimary,
      };

      if (accountId) {
        if (editingId) {
          const res = await accountService.updateAddress(accountId, editingId, data);
          updateAddresses((prev) => prev.map((a) => (a.id === editingId ? res.data.data : a)));
          toast.success(t("common.success"), { description: t("accounts.addressUpdateSuccess") });
        } else {
          const res = await accountService.createAddress(accountId, data);
          updateAddresses((prev) => [...prev, res.data.data]);
          toast.success(t("common.success"), { description: t("accounts.addressCreateSuccess") });
        }
      } else {
        if (editingId) {
          updateAddresses((prev) => prev.map((a) => a.id === editingId ? { ...a, ...data, id: editingId } : a));
        } else {
          const newAddress: AccountAddress = {
            id: crypto.randomUUID(),
            label: data.label,
            country: data.country ?? null,
            city: data.city ?? null,
            district: data.district ?? null,
            postalCode: data.postalCode ?? null,
            address: data.address ?? null,
            isPrimary: data.isPrimary ?? false,
          };
          updateAddresses((prev) => [...prev, newAddress]);
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
      if (accountId) {
        await accountService.deleteAddress(accountId, deleteId);
        toast.success(t("common.success"), { description: t("accounts.addressDeleteSuccess") });
      }
      updateAddresses((prev) => prev.filter((a) => a.id !== deleteId));
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
          <FormField control={form.control} name="label" render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("accounts.addressLabel")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><Tag className="h-4 w-4" /></InputGroupAddon>
                  <InputGroupInput placeholder={t("accounts.addressLabelPlaceholder")} {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("accounts.addressLabelDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("accounts.addressCountry")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Globe className="h-4 w-4" /></InputGroupAddon>
                    <InputGroupInput placeholder={t("accounts.addressCountryPlaceholder")} {...field} />
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("accounts.addressCountryDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("accounts.addressCity")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Building2 className="h-4 w-4" /></InputGroupAddon>
                    <InputGroupInput placeholder={t("accounts.addressCityPlaceholder")} {...field} />
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("accounts.addressCityDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="district" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("accounts.addressDistrict")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Map className="h-4 w-4" /></InputGroupAddon>
                    <InputGroupInput placeholder={t("accounts.addressDistrictPlaceholder")} {...field} />
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("accounts.addressDistrictDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="postalCode" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("accounts.addressPostalCode")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Mail className="h-4 w-4" /></InputGroupAddon>
                    <InputGroupInput placeholder={t("accounts.addressPostalCodePlaceholder")} {...field} />
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("accounts.addressPostalCodeDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("accounts.addressDetail")}</FormLabel>
              <FormControl>
                <InputGroupTextarea placeholder={t("accounts.addressDetailPlaceholder")} {...field} />
              </FormControl>
              <FormDescription>{t("accounts.addressDetailDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="isPrimary" render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="mt-0 inline-flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                {t("accounts.addressIsPrimary")}
              </FormLabel>
            </FormItem>
          )} />

          <div className="flex gap-2 justify-end">
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>{t("common.cancel")}</Button>
            )}
            <Button type="submit" disabled={loading} size="sm">
              {loading ? t("common.ellipsis") : (editingId ? t("common.save") : t("accounts.addAddress"))}
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="max-h-60 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("accounts.addressLabel")}</TableHead>
              <TableHead>{t("accounts.addressCountry")}</TableHead>
              <TableHead>{t("accounts.addressCity")}</TableHead>
              <TableHead>{t("accounts.addressDistrict")}</TableHead>
              <TableHead>{t("accounts.addressDetail")}</TableHead>
              <TableHead>{t("accounts.addressIsPrimary")}</TableHead>
              <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                  {t("common.empty")}
                </TableCell>
              </TableRow>
            )}
            {addresses.map((address) => (
              <TableRow key={address.id} className="group">
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {address.isPrimary && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                    {address.label}
                  </span>
                </TableCell>
                <TableCell>{address.country || "-"}</TableCell>
                <TableCell>{address.city || "-"}</TableCell>
                <TableCell>{address.district || "-"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{address.address || "-"}</TableCell>
                <TableCell>
                  {address.isPrimary && (
                    <Badge variant="secondary" className="text-xs">{t("accounts.addressIsPrimary")}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="invisible group-hover:visible flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(address)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={deleteId === address.id} onOpenChange={(v) => setDeleteId(v ? address.id : null)}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("accounts.deleteAddress")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("accounts.deleteAddressConfirm")}</AlertDialogDescription>
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
