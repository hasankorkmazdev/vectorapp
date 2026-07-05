import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { productService, type ProductListItem } from "@/features/products/services/product-service";
import { CreateProductDialog } from "@/features/products/components/CreateProductDialog";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Plus, Package, Hash, Ruler, DollarSign, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

export function ProductsPage() {
  useDocumentTitle("sidebar.productsList");
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<{ field: string; value: string }[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const loadProducts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await productService.getAll({
        page,
        pageSize,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
        filters,
      }, controller.signal);
      if (controller.signal.aborted) return;
      const result = response.data.data;
      setProducts(result.items);
      setTotalCount(result.totalCount);
    } catch (error: any) {
      if (error.name === "CanceledError") return;
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, filters, t]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const columns: Column<ProductListItem>[] = [
    {
      key: "code",
      label: t("products.code"),
      icon: <Hash className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      className: "font-mono text-xs",
      render: (p) => (
        <Link to={`/products/${p.id}`} className="hover:underline">
          {p.code}
        </Link>
      ),
    },
    {
      key: "name",
      label: t("products.name"),
      icon: <Package className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      className: "font-medium",
      render: (p) => p.name,
    },
    {
      key: "unit",
      label: t("products.unit"),
      icon: <Ruler className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      render: (p) => p.unit,
    },
    {
      key: "salePrice",
      label: t("products.salePrice"),
      icon: <DollarSign className="h-4 w-4" />,
      sortable: true,
      render: (p) =>
        p.salePrice != null
          ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p.salePrice)
          : "-",
    },
    {
      key: "isActive",
      label: t("products.isActive"),
      icon: <CheckCircle className="h-4 w-4" />,
      sortable: true,
      render: (p) => (p.isActive ? t("common.yes") : t("common.no")),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      icon: <Calendar className="h-4 w-4" />,
      sortable: true,
      render: (p) => new Date(p.createdAt).toLocaleDateString("tr-TR"),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.productsList")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("products.pageDescription")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("products.add")}
        </Button>
      </div>

      <CreateProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadProducts}
      />

      <DataTable
        columns={columns}
        data={products}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("products.empty")}
        sort={sort}
        filters={filters}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSort={(sortBy, sortDirection) => setSort({ sortBy, sortDirection })}
        onFilter={(f) => { setFilters(f); setPage(1); }}
      />
    </div>
  );
}
