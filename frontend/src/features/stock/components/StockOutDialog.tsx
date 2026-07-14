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
  destination: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

export function StockOutDialog({ productId, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, destination: "", note: "" },
  });

  const onSubmit = async (values: any) => {
    try {
      await stockService.stockOut(productId, {
        quantity: values.quantity,
        destination: values.destination || undefined,
        note: values.note || undefined,
      });
      toast.success(t("stock.stockOutSuccess"));
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
          <DialogTitle>{t("stock.stockOutTitle")}</DialogTitle>
          <DialogDescription>{t("stock.stockOutDescription")}</DialogDescription>
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
