import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { productService } from "@/features/products/services/product-service";
import { ProductForm } from "@/features/products/components/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function CreateProductPage() {
  useDocumentTitle("products.createTitle");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: { name: string; description?: string; unit: string; salePrice?: string; sellingCurrency: string }) => {
    setLoading(true);
    try {
      await productService.create({
        name: values.name,
        description: values.description || undefined,
        unit: values.unit,
        salePrice: values.salePrice ? parseFloat(values.salePrice) : undefined,
        sellingCurrency: values.sellingCurrency,
      });
      toast.success(t("common.success"), {
        description: t("products.createSuccess"),
      });
      navigate("/products");
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("products.createTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("products.createDescription")}
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <ProductForm onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  );
}
