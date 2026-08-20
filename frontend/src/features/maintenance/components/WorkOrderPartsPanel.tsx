import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Package, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { productService, type ProductListItem } from "@/features/products/services/product-service";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { MaintenanceWorkOrderItem, MaintenanceWorkOrderItemType } from "@/features/maintenance/types";

interface WorkOrderPartsPanelProps {
  workOrderId: string;
  items: MaintenanceWorkOrderItem[];
  canManage: boolean;
  onChanged: () => void;
}

export function WorkOrderPartsPanel({ workOrderId, items, canManage, onChanged }: WorkOrderPartsPanelProps) {
  const { t } = useTranslation();
  const { isMechanic } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemType, setItemType] = useState<MaintenanceWorkOrderItemType>("Part");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;
    productService.getAll({ page: 1, pageSize: 200 }).then((res) => setProducts(res.data.data.items)).catch(() => {});
  }, [dialogOpen]);

  const resetForm = () => {
    setItemType("Part");
    setProductId("");
    setDescription("");
    setQuantity("1");
    setUnitCost("");
    setProductSearch("");
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAdd = async () => {
    setLoading(true);
    try {
      await workOrderService.addItem(workOrderId, {
        type: itemType,
        productId: itemType === "Part" ? productId : undefined,
        description: itemType === "Labor" ? description : undefined,
        quantity: parseFloat(quantity),
        unitCost: itemType === "Labor" ? parseFloat(unitCost) : undefined,
      });
      toast.success(t("common.success"), { description: t("maintenance.itemAddSuccess") });
      resetForm();
      setDialogOpen(false);
      onChanged();
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    const confirmed = window.confirm(t("maintenance.itemRemoveConfirm"));
    if (!confirmed) return;
    try {
      await workOrderService.removeItem(workOrderId, itemId);
      toast.success(t("common.success"), { description: t("maintenance.itemRemoveSuccess") });
      onChanged();
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    }
  };

  const activeItems = items.filter((i) => !i.removedAt);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("maintenance.itemsTitle")}</h3>
        {canManage && (
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t("maintenance.itemAdd")}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("maintenance.itemName")}</TableHead>
              <TableHead>{t("maintenance.itemQuantity")}</TableHead>
              {!isMechanic && <TableHead className="text-right">{t("stock.unitCost")}</TableHead>}
              {!isMechanic && <TableHead className="text-right">{t("stock.totalCost")}</TableHead>}
              {canManage && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  {t("maintenance.itemsEmpty")}
                </TableCell>
              </TableRow>
            )}
            {activeItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="flex items-center gap-2">
                  {item.type === "Part" ? <Package className="h-4 w-4 text-muted-foreground" /> : <Wrench className="h-4 w-4 text-muted-foreground" />}
                  {item.type === "Part" ? item.productName : item.description}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                {!isMechanic && <TableCell className="text-right">{item.unitCost != null ? item.unitCost.toLocaleString() : "-"}</TableCell>}
                {!isMechanic && <TableCell className="text-right">{item.totalCost != null ? item.totalCost.toLocaleString() : "-"}</TableCell>}
                {canManage && (
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("maintenance.itemAdd")}</DialogTitle>
          </DialogHeader>

          <Tabs value={itemType} onValueChange={(v) => setItemType(v as MaintenanceWorkOrderItemType)}>
            <TabsList>
              <TabsTrigger value="Part">{t("maintenance.itemTypePart")}</TabsTrigger>
              <TabsTrigger value="Labor">{t("maintenance.itemTypeLabor")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {itemType === "Part" ? (
              <div className="space-y-2">
                <Label>{t("maintenance.itemProduct")}</Label>
                <input
                  type="text"
                  placeholder={t("maintenance.equipmentProductSearchPlaceholder")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className="max-h-32 overflow-y-auto rounded-md border">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent cursor-pointer ${productId === p.id ? "bg-accent font-medium" : ""}`}
                      onClick={() => setProductId(p.id)}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{p.code}</span>
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.stockQuantity} {p.unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t("maintenance.itemDescription")}</Label>
                <InputGroupInput
                  placeholder={t("maintenance.itemDescriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("maintenance.itemQuantity")}</Label>
                <InputGroup>
                  <InputGroupInput type="number" step="0.01" min="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </InputGroup>
              </div>
              {itemType === "Labor" && (
                <div className="space-y-2">
                  <Label>{t("stock.unitCost")}</Label>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">₺</InputGroupAddon>
                    <InputGroupInput type="number" step="0.01" min="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
                  </InputGroup>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={loading || (itemType === "Part" ? !productId : !description || !unitCost)}
              onClick={handleAdd}
            >
              {loading ? t("common.ellipsis") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
