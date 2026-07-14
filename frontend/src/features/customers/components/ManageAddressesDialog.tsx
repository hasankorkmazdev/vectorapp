import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { customerService } from "@/features/customers/services/customer-service";
import type { CustomerAddress, CreateAddressData } from "@/features/customers/types";

interface ManageAddressesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  initialAddresses?: CustomerAddress[];
  onAddressesChange?: (addresses: CustomerAddress[]) => void;
}

export function ManageAddressesDialog({ open, onOpenChange, customerId, initialAddresses, onAddressesChange }: ManageAddressesDialogProps) {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<CustomerAddress[]>(initialAddresses ?? []);

  useEffect(() => {
    if (open) {
      setAddresses(initialAddresses ?? []);
    }
  }, [open, initialAddresses]);

  const updateAddresses = (updater: CustomerAddress[] | ((prev: CustomerAddress[]) => CustomerAddress[])) => {
    setAddresses((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onAddressesChange?.(next);
      return next;
    });
  };
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
    defaultValues: {
      label: "",
      country: "",
      city: "",
      district: "",
      postalCode: "",
      address: "",
      isPrimary: false,
    },
  });

  const resetForm = () => {
    form.reset({ label: "", country: "", city: "", district: "", postalCode: "", address: "", isPrimary: false });
    setEditingId(null);
  };

  const startEdit = (address: CustomerAddress) => {
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

      if (customerId) {
        if (editingId) {
          const res = await customerService.updateAddress(customerId, editingId, data);
          updateAddresses((prev) => prev.map((a) => (a.id === editingId ? res.data.data : a)));
          toast.success(t("common.success"), { description: t("customers.addressUpdateSuccess") });
        } else {
          const res = await customerService.createAddress(customerId, data);
          updateAddresses((prev) => [...prev, res.data.data]);
          toast.success(t("common.success"), { description: t("customers.addressCreateSuccess") });
        }
      } else {
        if (editingId) {
          updateAddresses((prev) => prev.map((a) => a.id === editingId ? { ...a, ...data, id: editingId } : a));
        } else {
          const newAddress: CustomerAddress = {
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
      if (customerId) {
        await customerService.deleteAddress(customerId, deleteId);
        toast.success(t("common.success"), { description: t("customers.addressDeleteSuccess") });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("customers.addressesList")}</DialogTitle>
          <DialogDescription>{t("customers.addressesDescription")}</DialogDescription>
        </DialogHeader>

        {/* ── Form ── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
            <FormField control={form.control} name="label" render={({ field }) => (
              <FormItem>
                <FormLabel required>{t("customers.addressLabel")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Tag className="h-4 w-4" /></InputGroupAddon>
                    <InputGroupInput placeholder={t("customers.addressLabelPlaceholder")} {...field} />
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("customers.addressLabelDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.addressCountry")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Globe className="h-4 w-4" /></InputGroupAddon>
                      <InputGroupInput placeholder={t("customers.addressCountryPlaceholder")} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>{t("customers.addressCountryDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.addressCity")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Building2 className="h-4 w-4" /></InputGroupAddon>
                      <InputGroupInput placeholder={t("customers.addressCityPlaceholder")} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>{t("customers.addressCityDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.addressDistrict")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Map className="h-4 w-4" /></InputGroupAddon>
                      <InputGroupInput placeholder={t("customers.addressDistrictPlaceholder")} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>{t("customers.addressDistrictDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="postalCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.addressPostalCode")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Mail className="h-4 w-4" /></InputGroupAddon>
                      <InputGroupInput placeholder={t("customers.addressPostalCodePlaceholder")} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>{t("customers.addressPostalCodeDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customers.addressDetail")}</FormLabel>
                <FormControl>
                  <InputGroupTextarea placeholder={t("customers.addressDetailPlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{t("customers.addressDetailDescription")}</FormDescription>
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
                  {t("customers.addressIsPrimary")}
                </FormLabel>
              </FormItem>
            )} />

            <div className="flex gap-2 justify-end">
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>{t("common.cancel")}</Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? t("common.ellipsis") : (editingId ? t("common.save") : t("customers.addAddress"))}
              </Button>
            </div>
          </form>
        </Form>

        <Separator />

        {/* ── Tablo ── */}
        <div className="max-h-60 overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("customers.addressLabel")}</TableHead>
                <TableHead>{t("customers.addressCountry")}</TableHead>
                <TableHead>{t("customers.addressCity")}</TableHead>
                <TableHead>{t("customers.addressDistrict")}</TableHead>
                <TableHead>{t("customers.addressDetail")}</TableHead>
                <TableHead>{t("customers.addressIsPrimary")}</TableHead>
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
                      <Badge variant="secondary" className="text-xs">{t("customers.addressIsPrimary")}</Badge>
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
                            <AlertDialogTitle>{t("customers.deleteAddress")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("customers.deleteAddressConfirm")}</AlertDialogDescription>
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("customers.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
