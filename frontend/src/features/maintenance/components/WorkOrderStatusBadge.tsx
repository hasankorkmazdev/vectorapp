import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { MaintenanceWorkOrderStatus } from "@/features/maintenance/types";

const VARIANTS: Record<MaintenanceWorkOrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "outline",
  InProgress: "default",
  OnHold: "secondary",
  Completed: "secondary",
  Closed: "secondary",
  Cancelled: "destructive",
};

export function WorkOrderStatusBadge({ status }: { status: MaintenanceWorkOrderStatus }) {
  const { t } = useTranslation();
  return <Badge variant={VARIANTS[status]}>{t(`maintenance.status${status}`)}</Badge>;
}
