import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { stockService, type Warehouse } from "@/features/stock/services/stock-service";
import { supplierService } from "@/features/suppliers/services/supplier-service";
import type { Supplier } from "@/features/suppliers/types";

interface Props {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  unitCost: z.number().min(0).optional(),
  currency: z.string().min(1),
  warehouseId: z.string().min(1),
  supplierId: z.string().optional(),
  note: z.string().max(500).optional(),
});

const SELLING_CURRENCIES = ["TRY", "USD", "EUR"];

export function StockInDialog({ productId, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { unitCost: undefined, currency: "TRY", warehouseId: "", supplierId: undefined, note: "" },
  });

  const [quantityStr, setQuantityStr] = useState("1");

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    supplierService.getAll(controller.signal)
      .then(setSuppliers)
      .catch(() => {});
    stockService.getWarehouses(controller.signal)
      .then((res) => setWarehouses(res.data.value ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [open]);

  const onSubmit = async (values: any) => {
    const qty = Number(quantityStr);
    if (!qty || qty <= 0) return;
    try {
      await stockService.stockIn(productId, {
        quantity: qty,
        unitCost: values.unitCost || undefined,
        currency: values.currency,
        warehouseId: values.warehouseId,
        supplierId: values.supplierId || undefined,
        note: values.note || undefined,
      });
      toast.success(t("stock.stockInSuccess"));
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    }
  };

  const toOptionalNumber = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value === "" ? undefined : Number(e.target.value);

  const resetForm = () => {
    setQuantityStr("1");
    form.reset({ unitCost: undefined, currency: "TRY", warehouseId: "", supplierId: undefined, note: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("stock.stockInTitle")}</DialogTitle>
          <DialogDescription>{t("stock.stockInDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium leading-none">{t("stock.quantity")}</label>
              <Input
                type="text"
                inputMode="decimal"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
              />
              <p className="text-[0.8rem] text-muted-foreground">{t("stock.quantityDescription")}</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stock.unitCost")}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" value={field.value ?? ""} onChange={(e) => field.onChange(toOptionalNumber(e))} />
                      </FormControl>
                      <FormDescription>{t("stock.unitCostDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&nbsp;</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SELLING_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.warehouse")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("stock.warehousePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.code} - {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t("stock.warehouseDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.supplier")}</FormLabel>
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(val) => field.onChange(val === "__none__" ? undefined : val)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("stock.supplierPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">{t("stock.supplierNone")}</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t("stock.supplierDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.note")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>{t("stock.noteDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" />
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
