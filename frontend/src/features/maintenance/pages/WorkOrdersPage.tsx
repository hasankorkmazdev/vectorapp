import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { MaintenanceWorkOrderListItem, MaintenanceWorkOrderStatus } from "@/features/maintenance/types";
import { WorkOrderFormDialog } from "@/features/maintenance/components/WorkOrderFormDialog";
import { WorkOrderStatusBadge } from "@/features/maintenance/components/WorkOrderStatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { DataTable } from "@/components/data-table/DataTable";
import type { Column, SortState } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ClipboardList, Wrench, User } from "lucide-react";
import { toast } from "sonner";

const STATUSES: MaintenanceWorkOrderStatus[] = ["Open", "InProgress", "OnHold", "Completed", "Closed", "Cancelled"];

export function WorkOrdersPage() {
  useDocumentTitle("sidebar.workOrders");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMechanic } = useAuth();
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrderListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await workOrderService.getAll(
        {
          page,
          pageSize,
          sortBy: sort.sortBy,
          sortDirection: sort.sortDirection,
          status: statusFilter !== "all" ? (statusFilter as MaintenanceWorkOrderStatus) : undefined,
        },
        controller.signal
      );
      if (controller.signal.aborted) return;
      const result = response.data.data;
      setWorkOrders(result.items);
      setTotalCount(result.totalCount);
    } catch (error: any) {
      if (error.name === "CanceledError") return;
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, statusFilter, t]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<MaintenanceWorkOrderListItem>[] = [
    {
      key: "title",
      label: t("maintenance.workOrderTitle"),
      icon: <ClipboardList className="h-4 w-4" />,
      className: "font-medium",
      render: (w) => (
        <button className="hover:underline text-left" onClick={() => navigate(`/maintenance/${w.id}`)}>
          {w.title}
        </button>
      ),
    },
    {
      key: "equipmentName",
      label: t("maintenance.workOrderEquipment"),
      icon: <Wrench className="h-4 w-4" />,
      render: (w) => w.equipmentName || "-",
    },
    {
      key: "accountName",
      label: t("maintenance.equipmentAccount"),
      icon: null,
      render: (w) => w.accountName || "-",
    },
    {
      key: "status",
      label: t("maintenance.workOrderStatus"),
      icon: null,
      render: (w) => <WorkOrderStatusBadge status={w.status} />,
    },
    {
      key: "assignedToUserName",
      label: t("maintenance.workOrderAssignedTo"),
      icon: <User className="h-4 w-4" />,
      render: (w) => w.assignedToUserName || "-",
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      icon: null,
      sortable: true,
      render: (w) => new Date(w.createdAt).toLocaleDateString(),
    },
    ...(!isMechanic
      ? [
          {
            key: "laborCost",
            label: t("maintenance.workOrderLaborCost"),
            icon: null,
            className: "text-right",
            render: (w: MaintenanceWorkOrderListItem) => (w.laborCost != null ? w.laborCost.toLocaleString() : "-"),
          } as Column<MaintenanceWorkOrderListItem>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.workOrders")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("maintenance.workOrderPageDescription")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("maintenance.workOrderAdd")}
        </Button>
      </div>

      <WorkOrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(id) => navigate(`/maintenance/${id}`)}
      />

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("maintenance.workOrderStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("maintenance.statusAll")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{t(`maintenance.status${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={workOrders}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage={t("maintenance.workOrderEmpty")}
        sort={sort}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSort={(sortBy, sortDirection) => setSort({ sortBy, sortDirection })}
        onFilter={() => {}}
      />
    </div>
  );
}
