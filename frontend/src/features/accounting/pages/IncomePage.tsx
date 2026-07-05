import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Plus, Banknote, Tag, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  accountingService,
  type IncomeEntry,
} from "@/features/accounting/services/accounting-service";
import { IncomeFormDialog } from "@/features/accounting/components/IncomeFormDialog";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState, FilterValue } from "@/components/data-table/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(amount);
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Nakit",
  credit_card: "Kredi Kartı",
  bank_transfer: "Havale",
  check: "Çek",
};

export function IncomePage() {
  useDocumentTitle("sidebar.income");
  const { t } = useTranslation();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "date", sortDirection: "desc" });
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const loadIncomes = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const result = await accountingService.getIncomes({ page, pageSize });
      if (controller.signal.aborted) return;

      let items = result.items;
      if (filters.length > 0) {
        items = items.filter((item) =>
          filters.every((f) => {
            const val = String(item[f.field as keyof IncomeEntry] ?? "").toLowerCase();
            return val.includes(f.value.toLowerCase());
          })
        );
      }
      if (sort.sortBy) {
        items = [...items].sort((a, b) => {
          const aVal = a[sort.sortBy as keyof IncomeEntry] ?? "";
          const bVal = b[sort.sortBy as keyof IncomeEntry] ?? "";
          const cmp = String(aVal).localeCompare(String(bVal));
          return sort.sortDirection === "desc" ? -cmp : cmp;
        });
      }

      setIncomes(items);
      setTotalCount(result.totalCount);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, filters, t]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const columns: Column<IncomeEntry>[] = [
    {
      key: "date",
      label: t("financial.date"),
      icon: <Calendar className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      render: (item) => (
        <span className="text-xs">
          {new Date(item.date).toLocaleDateString("tr-TR")}
        </span>
      ),
    },
    {
      key: "description",
      label: t("financial.description"),
      icon: <Banknote className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      className: "font-medium",
      render: (item) => item.description,
    },
    {
      key: "categoryName",
      label: t("financial.category"),
      icon: <Tag className="h-4 w-4" />,
      filterable: true,
      render: (item) => (
        <Badge variant="outline" className="text-xs">
          {item.categoryName}
        </Badge>
      ),
    },
    {
      key: "paymentType",
      label: t("financial.paymentType"),
      icon: <Tag className="h-4 w-4" />,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {PAYMENT_LABELS[item.paymentType] || item.paymentType}
        </span>
      ),
    },
    {
      key: "amount",
      label: t("financial.amount"),
      icon: <Banknote className="h-4 w-4" />,
      sortable: true,
      className: "text-right",
      render: (item) => (
        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
          +{formatCurrency(item.amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.income")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("financial.incomePageDescription")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("financial.addIncome")}
        </Button>
      </div>

      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadIncomes}
      />

      <DataTable
        columns={columns}
        data={incomes}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("financial.noIncome")}
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
