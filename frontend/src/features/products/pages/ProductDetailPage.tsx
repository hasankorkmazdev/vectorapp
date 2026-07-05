import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { productService, type Product } from "@/features/products/services/product-service";
import { BomTreeView } from "@/features/products/components/BomTreeView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Ruler, FileText } from "lucide-react";
import { toast } from "sonner";

export function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await productService.getById(id);
      setProduct(res.data.data);
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(t("products.deleteConfirm"));
    if (!confirmed) return;
    try {
      await productService.delete(id);
      toast.success(t("common.success"), {
        description: t("products.deleteSuccess"),
      });
      navigate("/products");
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{product.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/products/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{t("products.tabDetails")}</TabsTrigger>
          <TabsTrigger value="bom">{t("products.tabBom")}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                {t("products.unit")}
              </span>
              <p className="text-lg font-semibold">{product.unit}</p>
            </div>

            {product.salePrice != null && (
              <div className="rounded-lg border p-4 space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  {t("products.salePrice")}
                </span>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(product.salePrice)}
                </p>
              </div>
            )}

            <div className="rounded-lg border p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5" />
                {t("products.bomCount")}
              </span>
              <p className="text-lg font-semibold">{product.bomItems.length}</p>
            </div>
          </div>

          {product.description && (
            <div className="rounded-lg border p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {t("products.description")}
              </span>
              <p className="text-sm">{product.description}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t("common.createdAt")}: {new Date(product.createdAt).toLocaleString("tr-TR")}</p>
            {product.updatedAt && (
              <p>{t("common.updatedAt")}: {new Date(product.updatedAt).toLocaleString("tr-TR")}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bom" className="mt-6">
          <BomTreeView productId={product.id} productName={product.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
