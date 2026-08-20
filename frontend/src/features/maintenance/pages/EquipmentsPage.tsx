import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { equipmentService } from "@/features/maintenance/services/equipment-service";
import type { EquipmentListItem } from "@/features/maintenance/types";
import { EquipmentDialog } from "@/features/maintenance/components/EquipmentDialog";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState, FilterValue } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Building2, Hash, Pencil } from "lucide-react";
import { toast } from "sonner";

export function EquipmentsPage() {
  useDocumentTitle("sidebar.equipmentList");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EquipmentListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await equipmentService.getAll({ page, pageSize, sortBy: sort.sortBy, sortDirection: sort.sortDirection, filters }, controller.signal);
      if (controller.signal.aborted) return;
      const result = response.data.data;
      setEquipment(result.items);
      setTotalCount(result.totalCount);
    } catch (error: any) {
      if (error.name === "CanceledError") return;
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, filters, t]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<EquipmentListItem>[] = [
    {
      key: "name",
      label: t("maintenance.equipmentName"),
      icon: <Wrench className="h-4 w-4" />,
      sortable: true,
      filterable: true,
      filterType: "text",
      className: "font-medium",
      render: (e) => (
        <button className="hover:underline text-left" onClick={() => navigate(`/equipment/${e.id}`)}>
          {e.name}
        </button>
      ),
    },
    {
      key: "accountName",
      label: t("maintenance.equipmentAccount"),
      icon: <Building2 className="h-4 w-4" />,
      render: (e) => e.accountName || "-",
    },
    {
      key: "category",
      label: t("maintenance.equipmentCategory"),
      icon: null,
      filterable: true,
      filterType: "text",
      render: (e) => e.category || "-",
    },
    {
      key: "serialNumber",
      label: t("maintenance.equipmentSerialNumber"),
      icon: <Hash className="h-4 w-4" />,
      filterable: true,
      filterType: "text",
      className: "font-mono text-xs",
      render: (e) => e.serialNumber || "-",
    },
    {
      key: "isActive",
      label: t("maintenance.equipmentIsActive"),
      icon: null,
      render: (e) => (
        <Badge variant={e.isActive ? "default" : "secondary"}>
          {e.isActive ? t("common.yes") : t("common.no")}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      icon: null,
      className: "w-[50px]",
      render: (e) => (
        <Button variant="ghost" size="icon" onClick={() => setEditingId(e.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.equipmentList")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("maintenance.equipmentPageDescription")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("maintenance.equipmentAdd")}
        </Button>
      </div>

      <EquipmentDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />

      {editingId && (
        <EquipmentDialog
          open={!!editingId}
          onOpenChange={(v) => { if (!v) setEditingId(null); }}
          onSuccess={load}
          equipmentId={editingId}
        />
      )}

      <DataTable
        columns={columns}
        data={equipment}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("maintenance.equipmentEmpty")}
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
