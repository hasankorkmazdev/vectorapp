import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { accountService } from "@/features/account/services/account-service";
import { tagService } from "@/features/tags/services/tag-service";
import type { Account } from "@/features/account/types";
import type { Tag } from "@/features/tags/types";
import { AccountDialog } from "@/features/account/components/AccountDialog";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState, FilterValue } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Hash, Building2, FileText, Landmark, Pencil } from "lucide-react";
import { toast } from "sonner";

export function AccountsPage() {
  useDocumentTitle("sidebar.accountsList");
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    tagService.getAll().then(setTags).catch(() => {});
  }, []);

  const loadAccounts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await accountService.getAll({
        page,
        pageSize,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
        filters,
      }, controller.signal);
      if (controller.signal.aborted) return;
      const result = response.data.data;
      setAccounts(result.items);
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
    loadAccounts();
  }, [loadAccounts]);

  function renderPhone(a: Account) {
    if (a.phone.length === 0) return "-";
    return (
      <span className="inline-flex items-center gap-1">
        <Phone className="h-3 w-3 shrink-0" />
        <span>{a.phone.join(", ")}</span>
      </span>
    );
  }

  function renderEmail(a: Account) {
    if (a.email.length === 0) return "-";
    return (
      <span className="inline-flex items-center gap-1">
        <Mail className="h-3 w-3 shrink-0" />
        <span>{a.email.join(", ")}</span>
      </span>
    );
  }

  const columns: Column<Account>[] = [
    {
      key: "code",
      label: t("accounts.code"),
      icon: <Hash className="h-4 w-4" />,
      placeholder: "C-002",
      sortable: true,
      filterable: true,
      filterType: "text",
      className: "font-mono text-xs",
      render: (a) => a.code,
    },
    {
      key: "companyName",
      label: t("accounts.companyName"),
      icon: <Building2 className="h-4 w-4" />,
      placeholder: t("ABC A.Ş."),
      sortable: true,
      filterable: true,
      filterType: "text",
      className: "font-medium",
      render: (a) => a.companyName,
    },
    {
      key: "tags",
      label: t("accounts.tags"),
      icon: null,
      filterable: true,
      filterType: "multi-select",
      filterOptions: tags.map((tag) => ({ label: tag.name, value: tag.name })),
      placeholder: t("accounts.tagsPlaceholder"),
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.tags.length === 0 && "-"}
          {a.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 text-xs">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: tag.color ?? "var(--muted-foreground)" }}
              />
              {tag.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "taxNumber",
      label: t("accounts.taxNumber"),
      icon: <FileText className="h-4 w-4" />,
      placeholder: "1111111111",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (a) => a.taxNumber || "-",
    },
    {
      key: "taxOffice",
      label: t("accounts.taxOffice"),
      icon: <Landmark className="h-4 w-4" />,
      placeholder: "Bakırköy V.D",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (a) => a.taxOffice || "-",
    },
    {
      key: "phone",
      label: t("accounts.phone"),
      icon: <Phone className="h-4 w-4" />,
      placeholder: "555 444 ...",
      filterable: true,
      filterType: "text",
      render: (a) => renderPhone(a),
    },
    {
      key: "email",
      label: t("accounts.email"),
      icon: <Mail className="h-4 w-4" />,
      placeholder: "abc@abc.com",
      filterable: true,
      filterType: "text",
      render: (a) => renderEmail(a),
    },
    {
      key: "actions",
      label: "",
      icon: null,
      className: "w-[50px]",
      render: (a) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingAccount(a)}
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
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.accountsList")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("accounts.pageDescription")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("accounts.add")}
        </Button>
      </div>

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadAccounts}
      />

      {editingAccount && (
        <AccountDialog
          open={!!editingAccount}
          onOpenChange={(v) => { if (!v) setEditingAccount(null); }}
          onSuccess={loadAccounts}
          accountId={editingAccount.id}
        />
      )}

      <DataTable
        columns={columns}
        data={accounts}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("accounts.empty")}
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
