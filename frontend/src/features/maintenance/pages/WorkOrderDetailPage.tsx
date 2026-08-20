import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { MaintenanceWorkOrder } from "@/features/maintenance/types";
import { WorkOrderStatusBadge } from "@/features/maintenance/components/WorkOrderStatusBadge";
import { WorkOrderStatusActions } from "@/features/maintenance/components/WorkOrderStatusActions";
import { WorkOrderPartsPanel } from "@/features/maintenance/components/WorkOrderPartsPanel";
import { WorkOrderNotesPanel } from "@/features/maintenance/components/WorkOrderNotesPanel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Wrench, User } from "lucide-react";
import { toast } from "sonner";

export function WorkOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMechanic, isOrganizationAdmin } = useAuth();
  const [workOrder, setWorkOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await workOrderService.getById(id);
      setWorkOrder(res.data.data);
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
      navigate("/maintenance");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !workOrder) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const canManage = isOrganizationAdmin || isMechanic;
  const canSeeCost = !isMechanic;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/maintenance")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{workOrder.title}</h1>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <Link to={`/equipment/${workOrder.equipmentId}`} className="hover:underline inline-flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                {workOrder.equipmentName}
              </Link>
              {" · "}
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {workOrder.accountName}
              </span>
            </p>
          </div>
        </div>
        <WorkOrderStatusActions workOrderId={workOrder.id} status={workOrder.status} onChanged={load} />
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-md border p-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("maintenance.workOrderAssignedTo")}:</span>
          <span>{workOrder.assignedToUserName || "-"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">{t("maintenance.workOrderRequestedAt")}:</span>{" "}
          {new Date(workOrder.requestedAt).toLocaleDateString()}
        </div>
        {canSeeCost && (
          <div>
            <span className="text-muted-foreground">{t("maintenance.workOrderLaborCost")}:</span>{" "}
            {workOrder.laborCost != null ? workOrder.laborCost.toLocaleString() : "-"}
          </div>
        )}
        {workOrder.description && (
          <div className="col-span-3">
            <span className="text-muted-foreground">{t("maintenance.workOrderDescription")}:</span> {workOrder.description}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkOrderPartsPanel workOrderId={workOrder.id} items={workOrder.items} canManage={canManage} onChanged={load} />
        <WorkOrderNotesPanel workOrderId={workOrder.id} notes={workOrder.notes} onChanged={load} />
      </div>
    </div>
  );
}
