import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Plus, Ruler } from "lucide-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { productService, type ProductListItem } from "@/features/products/services/product-service";

interface BomItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSuccess: () => void;
}

export function BomItemDialog({ open, onOpenChange, productId, onSuccess }: BomItemDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await productService.getAll({ page: 1, pageSize: 200 });
        setProducts(res.data.data.items.filter((p) => p.id !== productId));
      } catch {
        // silent
      }
    })();
  }, [open, productId]);

  const formSchema = z.object({
    componentProductId: z.string().min(1, t("validation.required")),
    quantity: z.string().min(1, t("validation.required")),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      componentProductId: "",
      quantity: "1",
      notes: "",
    },
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await productService.createBomItem(productId, {
        componentProductId: values.componentProductId,
        quantity: parseFloat(values.quantity),
        notes: values.notes || undefined,
      });
      toast.success(t("common.success"), {
        description: t("products.bomAddSuccess"),
      });
      form.reset();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("products.bomAdd")}
          </DialogTitle>
          <DialogDescription>{t("products.bomAddDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
            <FormField
              control={form.control}
              name="componentProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t("products.bomComponent")}
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder={t("products.bomSearchPlaceholder")}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto rounded-md border">
                        {filteredProducts.length === 0 && (
                          <p className="p-3 text-sm text-muted-foreground">{t("products.bomNoResults")}</p>
                        )}
                        {filteredProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent cursor-pointer ${
                              field.value === p.id ? "bg-accent font-medium" : ""
                            }`}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t("products.bomQuantity")}
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Ruler className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="1"
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>{t("products.bomQuantityDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("products.bomNotes")}</FormLabel>
                  <FormControl>
                    <InputGroupInput placeholder={t("products.bomNotesPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? t("common.ellipsis") : t("products.bomAdd")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
