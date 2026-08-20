import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Wrench, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipmentService } from "@/features/maintenance/services/equipment-service";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { EquipmentListItem, MechanicOption } from "@/features/maintenance/types";

interface WorkOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (workOrderId: string) => void;
  defaultEquipmentId?: string;
}

export function WorkOrderFormDialog({ open, onOpenChange, onSuccess, defaultEquipmentId }: WorkOrderFormDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [equipmentList, setEquipmentList] = useState<EquipmentListItem[]>([]);
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [mechanics, setMechanics] = useState<MechanicOption[]>([]);

  const formSchema = z.object({
    equipmentId: z.string().min(1, t("validation.required")),
    title: z.string().min(1, t("validation.required")),
    description: z.string().optional(),
    assignedToUserId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { equipmentId: defaultEquipmentId ?? "", title: "", description: "", assignedToUserId: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ equipmentId: defaultEquipmentId ?? "", title: "", description: "", assignedToUserId: "" });
    setEquipmentSearch("");
    if (!defaultEquipmentId) {
      equipmentService.getAll({ page: 1, pageSize: 200 }).then((res) => setEquipmentList(res.data.data.items)).catch(() => {});
    }
    workOrderService.getMechanics().then((res) => setMechanics(res.data.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultEquipmentId]);

  const filteredEquipment = equipmentList.filter((e) => e.name.toLowerCase().includes(equipmentSearch.toLowerCase()));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await workOrderService.create({
        equipmentId: values.equipmentId,
        title: values.title,
        description: values.description || undefined,
        assignedToUserId: values.assignedToUserId || undefined,
      });
      toast.success(t("common.success"), { description: t("maintenance.workOrderCreateSuccess") });
      onOpenChange(false);
      onSuccess(res.data.data.id);
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t("maintenance.workOrderCreateTitle")}
          </DialogTitle>
          <DialogDescription>{t("maintenance.workOrderCreateDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
            {!defaultEquipmentId && (
              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("maintenance.workOrderEquipment")}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={t("maintenance.equipmentAccountSearchPlaceholder")}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={equipmentSearch}
                          onChange={(e) => setEquipmentSearch(e.target.value)}
                        />
                        <div className="max-h-32 overflow-y-auto rounded-md border">
                          {filteredEquipment.length === 0 && (
                            <p className="p-3 text-sm text-muted-foreground">{t("maintenance.noResults")}</p>
                          )}
                          {filteredEquipment.map((e) => (
                            <button
                              key={e.id}
                              type="button"
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent cursor-pointer ${field.value === e.id ? "bg-accent font-medium" : ""}`}
                              onClick={() => field.onChange(e.id)}
                            >
                              <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1 truncate">{e.name}</span>
                              <span className="text-xs text-muted-foreground">{e.accountName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("maintenance.workOrderTitle")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><ClipboardList className="h-4 w-4" /></InputGroupAddon>
                      <InputGroupInput placeholder={t("maintenance.workOrderTitlePlaceholder")} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maintenance.workOrderDescription")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("maintenance.workOrderDescriptionPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedToUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maintenance.workOrderAssignedTo")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("maintenance.workOrderAssignPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mechanics.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                <Plus className="h-4 w-4" />
                {loading ? t("common.ellipsis") : t("maintenance.workOrderAdd")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
