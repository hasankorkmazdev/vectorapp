import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench, Building2, Package, Pencil, Plus, XCircle, CheckCircle } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { equipmentService } from "@/features/maintenance/services/equipment-service";
import { accountService } from "@/features/account/services/account-service";
import { productService } from "@/features/products/services/product-service";
import type { Account } from "@/features/account/types";
import type { ProductListItem } from "@/features/products/services/product-service";

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  equipmentId?: string;
  defaultAccountId?: string;
}

export function EquipmentDialog({ open, onOpenChange, onSuccess, equipmentId, defaultAccountId }: EquipmentDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!equipmentId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const formSchema = z.object({
    accountId: z.string().min(1, t("validation.required")),
    productId: z.string().optional(),
    name: z.string().min(1, t("validation.required")),
    category: z.string().optional(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    note: z.string().optional(),
    isActive: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: defaultAccountId ?? "",
      productId: "",
      name: "",
      category: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      note: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    accountService.getAll({ page: 1, pageSize: 200 }).then((res) => setAccounts(res.data.data.items)).catch(() => {});
    productService.getAll({ page: 1, pageSize: 200 }).then((res) => setProducts(res.data.data.items)).catch(() => {});
  }, [open]);

  const fetchEquipment = useCallback(async () => {
    if (!equipmentId) return;
    setFetching(true);
    try {
      const res = await equipmentService.getById(equipmentId);
      const data = res.data.data;
      form.reset({
        accountId: data.accountId,
        productId: data.productId ?? "",
        name: data.name,
        category: data.category ?? "",
        manufacturer: data.manufacturer ?? "",
        model: data.model ?? "",
        serialNumber: data.serialNumber ?? "",
        note: data.note ?? "",
        isActive: data.isActive,
      });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setFetching(false);
    }
  }, [equipmentId, form, t]);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        fetchEquipment();
      } else {
        form.reset({
          accountId: defaultAccountId ?? "",
          productId: "",
          name: "",
          category: "",
          manufacturer: "",
          model: "",
          serialNumber: "",
          note: "",
          isActive: true,
        });
      }
      setAccountSearch("");
      setProductSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit]);

  const filteredAccounts = accounts.filter((a) => a.companyName.toLowerCase().includes(accountSearch.toLowerCase()));
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const payload = {
        accountId: values.accountId,
        productId: values.productId || undefined,
        name: values.name,
        category: values.category || undefined,
        manufacturer: values.manufacturer || undefined,
        model: values.model || undefined,
        serialNumber: values.serialNumber || undefined,
        note: values.note || undefined,
      };
      if (isEdit) {
        await equipmentService.update(equipmentId!, { ...payload, isActive: values.isActive });
        toast.success(t("common.success"), { description: t("maintenance.equipmentUpdateSuccess") });
      } else {
        await equipmentService.create(payload);
        toast.success(t("common.success"), { description: t("maintenance.equipmentCreateSuccess") });
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="inline-flex items-center gap-2">
            {isEdit ? <Pencil className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
            {isEdit ? t("maintenance.equipmentEditTitle") : t("maintenance.equipmentCreateTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("maintenance.equipmentEditDescription") : t("maintenance.equipmentCreateDescription")}
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form noValidate autoComplete="off" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("maintenance.equipmentAccount")}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={t("maintenance.equipmentAccountSearchPlaceholder")}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={accountSearch}
                          onChange={(e) => setAccountSearch(e.target.value)}
                        />
                        <div className="max-h-32 overflow-y-auto rounded-md border">
                          {filteredAccounts.length === 0 && (
                            <p className="p-3 text-sm text-muted-foreground">{t("maintenance.noResults")}</p>
                          )}
                          {filteredAccounts.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent cursor-pointer ${field.value === a.id ? "bg-accent font-medium" : ""}`}
                              onClick={() => field.onChange(a.id)}
                            >
                              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1 truncate">{a.companyName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("maintenance.equipmentName")}</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start"><Wrench className="h-4 w-4" /></InputGroupAddon>
                        <InputGroupInput placeholder={t("maintenance.equipmentNamePlaceholder")} {...field} />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("maintenance.equipmentProduct")}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={t("maintenance.equipmentProductSearchPlaceholder")}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                        <div className="max-h-32 overflow-y-auto rounded-md border">
                          <button
                            type="button"
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent cursor-pointer ${!field.value ? "bg-accent font-medium" : ""}`}
                            onClick={() => field.onChange("")}
                          >
                            {t("maintenance.equipmentProductNone")}
                          </button>
                          {filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent cursor-pointer ${field.value === p.id ? "bg-accent font-medium" : ""}`}
                              onClick={() => field.onChange(p.id)}
                            >
                              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="font-mono text-xs text-muted-foreground">{p.code}</span>
                              <span className="flex-1 truncate">{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>{t("maintenance.equipmentProductDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("maintenance.equipmentCategory")}</FormLabel>
                      <FormControl>
                        <InputGroupInput placeholder={t("maintenance.equipmentCategoryPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("maintenance.equipmentSerialNumber")}</FormLabel>
                      <FormControl>
                        <InputGroupInput placeholder={t("maintenance.equipmentSerialNumberPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("maintenance.equipmentManufacturer")}</FormLabel>
                      <FormControl>
                        <InputGroupInput placeholder={t("maintenance.equipmentManufacturerPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("maintenance.equipmentModel")}</FormLabel>
                      <FormControl>
                        <InputGroupInput placeholder={t("maintenance.equipmentModelPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("maintenance.equipmentNote")}</FormLabel>
                    <FormControl>
                      <InputGroupInput placeholder={t("maintenance.equipmentNotePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                      <Label>{t("maintenance.equipmentIsActive")}</Label>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        )}

        <DialogFooter className="flex-row gap-2 shrink-0 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <XCircle className="h-4 w-4" />
            {t("common.cancel")}
          </Button>
          <Button type="button" disabled={loading || fetching} onClick={form.handleSubmit(onSubmit)}>
            {isEdit ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {loading ? t("common.ellipsis") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
