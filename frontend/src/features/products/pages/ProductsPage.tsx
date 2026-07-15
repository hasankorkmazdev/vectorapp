import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { productService, type ProductListItem } from "@/features/products/services/product-service";
import { productGroupService, type ProductGroup } from "@/features/products/services/product-group-service";
import { CreateProductDialog } from "@/features/products/components/CreateProductDialog";
import { StockInDialog } from "@/features/stock/components/StockInDialog";
import { StockOutDialog } from "@/features/stock/components/StockOutDialog";
import { StockMovementsPanel } from "@/features/stock/components/StockMovementsPanel";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState, FilterValue } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Plus, Package, Hash, Ruler, ArrowDownToLine, ArrowUpFromLine, History, Warehouse, FolderTree, Coins, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export function StocksPage() {
  useDocumentTitle("sidebar.stocksList");
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const [stockInProductId, setStockInProductId] = useState<string | null>(null);
  const [stockOutProduct, setStockOutProduct] = useState<{ id: string; unit: string } | null>(null);
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

  useEffect(() => {
    productGroupService.getAll().then((res) => {
      const body = res.data;
      setGroups(Array.isArray(body) ? body : body?.value ?? []);
    });
  }, []);

  const groupOptions = groups.map((g) => ({ label: g.name, value: g.name }));

  const unitOptions = [
    { label: "Adet", value: "adet" },
    { label: "Kg", value: "kg" },
    { label: "Litre", value: "litre" },
    { label: "Metre", value: "m" },
    { label: "m²", value: "m2" },
    { label: "m³", value: "m3" },
    { label: "Paket", value: "paket" },
    { label: "Kutu", value: "kutu" },
    { label: "Takım", value: "takım" },
    { label: "Çift", value: "çift" },
  ];

  const fmtCurrency = (v: number | null, currency?: string | null) => {
    if (v == null) return "-";
    const cur = currency || "TRY";
    const formatted = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
    return (
      <span>
        <span className="font-semibold">{cur}</span>{" "}{formatted}
      </span>
    );
  };

  const renderStockActions = (p: ProductListItem) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" title={t("stock.stockIn")} onClick={() => setStockInProductId(p.id)}>
        <ArrowDownToLine className="h-4 w-4 text-green-600" />
      </Button>
      <Button variant="ghost" size="icon" title={t("stock.stockOut")} onClick={() => setStockOutProduct({ id: p.id, unit: p.unit })}>
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
      className: "font-medium whitespace-nowrap",
      render: (p) => p.name,
    },
    {
      key: "groupName",
      label: t("products.group"),
      icon: <FolderTree className="h-4 w-4" />,
      sortable: false,
      filterable: true,
      filterType: "select",
      filterOptions: groupOptions,
      className: "whitespace-nowrap",
      render: (p) => p.groupName ?? "-",
    },
    {
      key: "avgCost",
      label: t("stock.avgCost"),
      icon: <Coins className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => fmtCurrency(p.avgCost, p.sellingCurrency),
    },
    {
      key: "lastPurchasePrice",
      label: t("stock.lastPurchasePrice"),
      icon: <ShoppingBag className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => fmtCurrency(p.lastPurchasePrice, p.sellingCurrency),
    },
    {
      key: "salePrice",
      label: t("products.salePrice"),
      icon: "",
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (p) => fmtCurrency(p.salePrice, p.sellingCurrency),
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

      {stockOutProduct && (
        <StockOutDialog
          productId={stockOutProduct.id}
          unit={stockOutProduct.unit}
          open={!!stockOutProduct}
          onOpenChange={() => setStockOutProduct(null)}
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
