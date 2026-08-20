import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { equipmentService } from "@/features/maintenance/services/equipment-service";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { Equipment, MaintenanceWorkOrderListItem } from "@/features/maintenance/types";
import { EquipmentDialog } from "@/features/maintenance/components/EquipmentDialog";
import { WorkOrderFormDialog } from "@/features/maintenance/components/WorkOrderFormDialog";
import { WorkOrderStatusBadge } from "@/features/maintenance/components/WorkOrderStatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Plus, Building2, Package, Hash } from "lucide-react";
import { toast } from "sonner";

export function EquipmentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMechanic } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [history, setHistory] = useState<MaintenanceWorkOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [newWorkOrderOpen, setNewWorkOrderOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [eqRes, historyRes] = await Promise.all([
        equipmentService.getById(id),
        workOrderService.getAll({ equipmentId: id, pageSize: 100 }),
      ]);
      setEquipment(eqRes.data.data);
      setHistory(historyRes.data.data.items);
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
      navigate("/equipment");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !equipment) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/equipment")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{equipment.accountName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button onClick={() => setNewWorkOrderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("maintenance.workOrderAdd")}
          </Button>
        </div>
      </div>

      <EquipmentDialog open={editOpen} onOpenChange={setEditOpen} onSuccess={load} equipmentId={equipment.id} />
      <WorkOrderFormDialog
        open={newWorkOrderOpen}
        onOpenChange={setNewWorkOrderOpen}
        onSuccess={(workOrderId) => navigate(`/maintenance/${workOrderId}`)}
        defaultEquipmentId={equipment.id}
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{t("maintenance.equipmentTabDetails")}</TabsTrigger>
          <TabsTrigger value="history">{t("maintenance.equipmentTabHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("maintenance.equipmentAccount")}:</span>
              <span>{equipment.accountName || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("maintenance.equipmentProduct")}:</span>
              <span>{equipment.productName || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("maintenance.equipmentCategory")}:</span>
              <span>{equipment.category || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("maintenance.equipmentSerialNumber")}:</span>
              <span>{equipment.serialNumber || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("maintenance.equipmentManufacturer")}:</span>
              <span>{equipment.manufacturer || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("maintenance.equipmentModel")}:</span>
              <span>{equipment.model || "-"}</span>
            </div>
            {equipment.note && (
              <div className="col-span-2 text-sm">
                <span className="text-muted-foreground">{t("maintenance.equipmentNote")}:</span> {equipment.note}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("maintenance.workOrderTitle")}</TableHead>
                  <TableHead>{t("maintenance.workOrderStatus")}</TableHead>
                  <TableHead>{t("maintenance.workOrderAssignedTo")}</TableHead>
                  <TableHead>{t("common.createdAt")}</TableHead>
                  {!isMechanic && <TableHead className="text-right">{t("maintenance.workOrderLaborCost")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isMechanic ? 4 : 5} className="text-center text-muted-foreground py-8">
                      {t("maintenance.workOrderHistoryEmpty")}
                    </TableCell>
                  </TableRow>
                )}
                {history.map((w) => (
                  <TableRow key={w.id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/maintenance/${w.id}`)}>
                    <TableCell className="font-medium">{w.title}</TableCell>
                    <TableCell><WorkOrderStatusBadge status={w.status} /></TableCell>
                    <TableCell>{w.assignedToUserName || "-"}</TableCell>
                    <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                    {!isMechanic && (
                      <TableCell className="text-right">{w.laborCost != null ? w.laborCost.toLocaleString() : "-"}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
