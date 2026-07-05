import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { productService } from "@/features/products/services/product-service";
import { ProductForm } from "@/features/products/components/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function EditProductPage() {
  useDocumentTitle("products.editTitle");
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<{
    name: string;
    description?: string;
    unit: string;
    salePrice?: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await productService.getById(id);
        const product = res.data.data;
        setInitialValues({
          name: product.name,
          description: product.description ?? "",
          unit: product.unit,
          salePrice: product.salePrice?.toString() ?? "",
        });
      } catch (error: any) {
        toast.error(t("common.error"), {
          description: error.response?.data?.message || t("common.error"),
        });
        navigate("/products");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, navigate, t]);

  const onSubmit = async (values: { name: string; description?: string; unit: string; salePrice?: string }) => {
    if (!id) return;
    setLoading(true);
    try {
      await productService.update(id, {
        name: values.name,
        description: values.description || undefined,
        unit: values.unit,
        salePrice: values.salePrice ? parseFloat(values.salePrice) : undefined,
        isActive: true,
      });
      toast.success(t("common.success"), {
        description: t("products.updateSuccess"),
      });
      navigate(`/products/${id}`);
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("products.editTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("products.editDescription")}
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        {initialValues && (
          <ProductForm initialValues={initialValues} onSubmit={onSubmit} loading={loading} />
        )}
      </div>
    </div>
  );
}
