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
import { Button } from "@/components/ui/button";
import { stockService } from "@/features/stock/services/stock-service";

interface Props {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  quantity: z.number().positive(),
  unitCost: z.number().min(0).optional(),
  source: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

export function StockInDialog({ productId, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, unitCost: undefined, source: "", note: "" },
  });

  const onSubmit = async (values: any) => {
    try {
      await stockService.stockIn(productId, {
        quantity: values.quantity,
        unitCost: values.unitCost || undefined,
        source: values.source || undefined,
        note: values.note || undefined,
      });
      toast.success(t("stock.stockInSuccess"));
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    }
  };

  const toNumber = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value === "" ? undefined : Number(e.target.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("stock.stockInTitle")}</DialogTitle>
          <DialogDescription>{t("stock.stockInDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.quantity")}</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={(e) => field.onChange(toNumber(e))} />
                  </FormControl>
                  <FormDescription>{t("stock.quantityDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.unitCost")}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" value={field.value ?? ""} onChange={(e) => field.onChange(toNumber(e))} />
                  </FormControl>
                  <FormDescription>{t("stock.unitCostDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stock.source")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{t("stock.sourceDescription")}</FormDescription>
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
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{t("stock.noteDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">{t("common.save")}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
