import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { customerService } from "@/features/customers/services/customer-service";
import type { Customer } from "@/features/customers/types";
import { CustomerDialog } from "@/features/customers/components/CustomerDialog";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState, FilterValue } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, Hash, Building2, FileText, Landmark, Pencil } from "lucide-react";
import { toast } from "sonner";

export function CustomersPage() {
  useDocumentTitle("sidebar.customersList");
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<FilterValue[]>([]);
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

  function renderPhone(c: Customer) {
    if (c.phone.length === 0) return "-";
    return (
      <span className="inline-flex items-center gap-1">
        <Phone className="h-3 w-3 shrink-0" />
        <span>{c.phone.join(", ")}</span>
      </span>
    );
  }

  function renderEmail(c: Customer) {
    if (c.email.length === 0) return "-";
    return (
      <span className="inline-flex items-center gap-1">
        <Mail className="h-3 w-3 shrink-0" />
        <span>{c.email.join(", ")}</span>
      </span>
    );
  }

  const columns: Column<Customer>[] = [
    {
      key: "code",
      label: t("customers.code"),
      icon: <Hash className="h-4 w-4" />,
      placeholder: "C-002",
      sortable: true,
      filterable: true,
      filterType: "text",
      className: "font-mono text-xs",
      render: (c) => c.code,
    },
    {
      key: "companyName",
      label: t("customers.companyName"),
      icon: <Building2 className="h-4 w-4" />,
      placeholder: t("ABC A.Ş."),
      sortable: true,
      filterable: true,
      filterType: "text",
      className: "font-medium",
      render: (c) => c.companyName,
    },
    {
      key: "taxNumber",
      label: t("customers.taxNumber"),
      icon: <FileText className="h-4 w-4" />,
      placeholder: "1111111111",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (c) => c.taxNumber || "-",
    },
    {
      key: "taxOffice",
      label: t("customers.taxOffice"),
      icon: <Landmark className="h-4 w-4" />,
      placeholder: "Bakırköy V.D",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (c) => c.taxOffice || "-",
    },
    {
      key: "phone",
      label: t("customers.phone"),
      icon: <Phone className="h-4 w-4" />,
      placeholder: "555 444 ...",
      filterable: true,
      filterType: "text",
      render: (c) => renderPhone(c),
    },
    {
      key: "email",
      label: t("customers.email"),
      icon: <Mail className="h-4 w-4" />,
      placeholder: "abc@abc.com",
      filterable: true,
      filterType: "text",
      render: (c) => renderEmail(c),
    },
    {
      key: "actions",
      label: "",
      icon: null,
      className: "w-[50px]",
      render: (c) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingCustomer(c)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
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

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadCustomers}
      />

      {editingCustomer && (
        <CustomerDialog
          open={!!editingCustomer}
          onOpenChange={(v) => { if (!v) setEditingCustomer(null); }}
          onSuccess={loadCustomers}
          customerId={editingCustomer.id}
        />
      )}

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
