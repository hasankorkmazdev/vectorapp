import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { MaintenanceWorkOrderStatus } from "@/features/maintenance/types";

const ALLOWED_TRANSITIONS: Record<MaintenanceWorkOrderStatus, MaintenanceWorkOrderStatus[]> = {
  Open: ["InProgress", "Cancelled"],
  InProgress: ["OnHold", "Completed", "Cancelled"],
  OnHold: ["InProgress", "Cancelled"],
  Completed: ["Closed"],
  Closed: [],
  Cancelled: [],
};

interface WorkOrderStatusActionsProps {
  workOrderId: string;
  status: MaintenanceWorkOrderStatus;
  onChanged: () => void;
}

export function WorkOrderStatusActions({ workOrderId, status, onChanged }: WorkOrderStatusActionsProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const nextStatuses = ALLOWED_TRANSITIONS[status];

  const handleChange = async (next: MaintenanceWorkOrderStatus) => {
    setLoading(true);
    try {
      await workOrderService.changeStatus(workOrderId, next);
      toast.success(t("common.success"), { description: t("maintenance.workOrderStatusUpdateSuccess") });
      onChanged();
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    } finally {
      setLoading(false);
    }
  };

  if (nextStatuses.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((next) => (
        <Button
          key={next}
          size="sm"
          variant={next === "Cancelled" ? "destructive" : "outline"}
          disabled={loading}
          onClick={() => handleChange(next)}
        >
          {t(`maintenance.transitionTo${next}`)}
        </Button>
      ))}
    </div>
  );
}
