import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { productService, type ProductListItem } from "@/features/products/services/product-service";
import { CreateProductDialog } from "@/features/products/components/CreateProductDialog";
import { StockInDialog } from "@/features/stock/components/StockInDialog";
import { StockOutDialog } from "@/features/stock/components/StockOutDialog";
import { StockMovementsPanel } from "@/features/stock/components/StockMovementsPanel";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState, FilterValue } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Plus, Package, Hash, Ruler, DollarSign, ArrowDownToLine, ArrowUpFromLine, History, Warehouse, Coins, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export function StocksPage() {
  useDocumentTitle("sidebar.stocksList");
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const [stockInProductId, setStockInProductId] = useState<string | null>(null);
  const [stockOutProductId, setStockOutProductId] = useState<string | null>(null);
  const [movementsProductId, setMovementsProductId] = useState<string | null>(null);

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

  const unitOptions = [
    { label: "Adet", value: "adet" },
    { label: "Kg", value: "kg" },
    { label: "Litre", value: "litre" },
    { label: "Metre", value: "m" },
    { label: "m²", value: "m2" },
    { label: "m³", value: "m3" },
    { label: "Paket", value: "paket" },
    { label: "Kutu", value: "kutu" },
  ];

  const fmtCurrency = (v: number | null) =>
    v != null
      ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v)
      : "-";

  const renderStockActions = (p: ProductListItem) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" title={t("stock.stockIn")} onClick={() => setStockInProductId(p.id)}>
        <ArrowDownToLine className="h-4 w-4 text-green-600" />
      </Button>
      <Button variant="ghost" size="icon" title={t("stock.stockOut")} onClick={() => setStockOutProductId(p.id)}>
        <ArrowUpFromLine className="h-4 w-4 text-red-600" />
      </Button>
      <Button variant="ghost" size="icon" title={t("stock.movements")} onClick={() => setMovementsProductId(p.id)}>
        <History className="h-4 w-4" />
      </Button>
    </div>
  );

  const columns: Column<ProductListItem>[] = [
    {
      key: "code",
      label: t("products.code"),
      icon: <Hash className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "text",
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
      filterType: "text",
      className: "font-medium",
      render: (p) => p.name,
    },
    {
      key: "stockQuantity",
      label: t("stock.stockQuantity"),
      icon: <Warehouse className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => p.stockQuantity,
    },
    {
      key: "avgCost",
      label: t("stock.avgCost"),
      icon: <Coins className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => fmtCurrency(p.avgCost),
    },
    {
      key: "lastPurchasePrice",
      label: t("stock.lastPurchasePrice"),
      icon: <ShoppingBag className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => fmtCurrency(p.lastPurchasePrice),
    },
    {
      key: "salePrice",
      label: t("products.salePrice"),
      icon: <DollarSign className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => fmtCurrency(p.salePrice),
    },
    {
      key: "unit",
      label: t("products.unit"),
      icon: <Ruler className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: unitOptions,
      render: (p) => p.unit,
    },
    {
      key: "actions",
      label: t("common.actions"),
      icon: <></>,
      render: (p) => renderStockActions(p),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.stocksList")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("stock.pageDescription")}
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

      {stockInProductId && (
        <StockInDialog
          productId={stockInProductId}
          open={!!stockInProductId}
          onOpenChange={() => setStockInProductId(null)}
          onSuccess={loadProducts}
        />
      )}

      {stockOutProductId && (
        <StockOutDialog
          productId={stockOutProductId}
          open={!!stockOutProductId}
          onOpenChange={() => setStockOutProductId(null)}
          onSuccess={loadProducts}
        />
      )}

      {movementsProductId && (
        <StockMovementsPanel
          productId={movementsProductId}
          open={!!movementsProductId}
          onOpenChange={() => setMovementsProductId(null)}
        />
      )}

      <DataTable
        columns={columns}
        data={products}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("stock.empty")}
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
