import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { productService } from "@/features/products/services/product-service";
import { ProductForm } from "@/features/products/components/ProductForm";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateProductDialog({ open, onOpenChange, onSuccess }: CreateProductDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: { code: string; name: string; description?: string; unit: string; salePrice?: string; sellingCurrency: string; groupId?: string }) => {
    setLoading(true);
    try {
      await productService.create({
        code: values.code,
        name: values.name,
        description: values.description || undefined,
        unit: values.unit,
        salePrice: values.salePrice ? parseFloat(values.salePrice) : undefined,
        sellingCurrency: values.sellingCurrency,
        groupId: values.groupId || undefined,
      });
      toast.success(t("common.success"), {
        description: t("products.createSuccess"),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("products.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("products.createDescription")}</DialogDescription>
        </DialogHeader>
        <ProductForm onSubmit={onSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  );
}
