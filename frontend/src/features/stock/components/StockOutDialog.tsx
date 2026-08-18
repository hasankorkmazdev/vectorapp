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
import { stockService } from "@/features/stock/services/stock-service";
import { customerService } from "@/features/customers/services/customer-service";
import type { Customer } from "@/features/customers/types";

interface Props {
  productId: string;
  unit: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  customerId: z.string().optional(),
  destination: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

export function StockOutDialog({ productId, unit, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { customerId: undefined, destination: "", note: "" },
  });

  const [quantityStr, setQuantityStr] = useState("1");

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    customerService.getAll({ pageSize: 500 }, controller.signal)
      .then((res) => {
        const body = res.data;
        setCustomers(Array.isArray(body) ? body : body?.value ?? []);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open]);

  const onSubmit = async (values: any) => {
    const qty = Number(quantityStr);
    if (!qty || qty <= 0) return;
    try {
      await stockService.stockOut(productId, {
        quantity: qty,
        customerId: values.customerId || undefined,
        destination: values.destination || undefined,
        note: values.note || undefined,
      });
      toast.success(t("stock.stockOutSuccess"));
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    }
  };

  const resetForm = () => {
    setQuantityStr("1");
    form.reset({ customerId: undefined, destination: "", note: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("stock.stockOutTitle")}</DialogTitle>
          <DialogDescription>{t("stock.stockOutDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium leading-none">{t("stock.quantity")}</label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={quantityStr}
                  onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === "") setQuantityStr(e.target.value); }}
                  className="pr-12"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">{t("stock.quantityDescription")}</p>
            </div>
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.customer")}</FormLabel>
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(val) => field.onChange(val === "__none__" ? undefined : val)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("stock.customerPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">{t("stock.customerNone")}</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t("stock.customerDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.destination")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{t("stock.destinationDescription")}</FormDescription>
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
