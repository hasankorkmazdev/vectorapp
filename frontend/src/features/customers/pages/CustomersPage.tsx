import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { customerService, type Customer } from "@/features/customers/services/customer-service";
import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export function CustomersPage() {
  useDocumentTitle("sidebar.customersList");
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<{ field: string; value: string }[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const loadCustomers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await customerService.getAll({
        page,
        pageSize,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
        filters,
      }, controller.signal);
      if (controller.signal.aborted) return;
      const result = response.data.data;
      setCustomers(result.items);
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
    loadCustomers();
  }, [loadCustomers]);

  const columns: Column<Customer>[] = [
    {
      key: "code",
      label: t("customers.code"),
      sortable: true,
      filterable: true,
      className: "font-mono text-xs",
      render: (c) => c.code,
    },
    {
      key: "companyName",
      label: t("customers.companyName"),
      sortable: true,
      filterable: true,
      className: "font-medium",
      render: (c) => c.companyName,
    },
    {
      key: "taxNumber",
      label: t("customers.taxNumber"),
      sortable: true,
      filterable: true,
      render: (c) => c.taxNumber || "-",
    },
    {
      key: "taxOffice",
      label: t("customers.taxOffice"),
      sortable: true,
      filterable: true,
      render: (c) => c.taxOffice || "-",
    },
    {
      key: "phone",
      label: t("customers.phone"),
      filterable: true,
      render: (c) => c.phone.length > 0
        ? (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{c.phone.join(", ")}</span>
          </span>
        ) : "-",
    },
    {
      key: "email",
      label: t("customers.email"),
      filterable: true,
      render: (c) => c.email.length > 0
        ? (
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" />
            <span>{c.email.join(", ")}</span>
          </span>
        ) : "-",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.customersList")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("customers.pageDescription")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("customers.add")}
        </Button>
      </div>

      <CreateCustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadCustomers}
      />

      <DataTable
        columns={columns}
        data={customers}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("customers.empty")}
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
