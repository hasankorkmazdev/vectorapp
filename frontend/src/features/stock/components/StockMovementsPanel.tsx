import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { stockService, type StockMovement } from "@/features/stock/services/stock-service";

interface Props {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockMovementsPanel({ productId, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await stockService.getMovements(productId);
      if (!controller.signal.aborted) {
        setMovements(res.data.value ?? []);
      }
    } catch (error: any) {
      if (error.name === "CanceledError") return;
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  }, [productId, t]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const fmtCurrency = (v: number | null) =>
    v != null
      ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v)
      : "-";

  const typeLabel = (type: string) => {
    switch (type) {
      case "In": return t("stock.typeIn");
      case "Out": return t("stock.typeOut");
      default: return t("stock.typeAdjustment");
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "In": return "text-green-600";
      case "Out": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("stock.movementsTitle")}</DialogTitle>
          <DialogDescription>{t("stock.movementsDescription")}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : movements.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("stock.movementsEmpty")}</div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="border rounded-md p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${typeColor(m.type)}`}>{typeLabel(m.type)}</span>
                  <span className="text-muted-foreground">{new Date(m.createdAt).toLocaleString("tr-TR")}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <span>{t("stock.quantity")}: {m.quantity}</span>
                  {m.unitCost != null && <span>{t("stock.unitCost")}: {fmtCurrency(m.unitCost)}</span>}
                  {m.totalCost != null && <span>{t("stock.totalCost")}: {fmtCurrency(m.totalCost)}</span>}
                  {m.source && <span>{t("stock.source")}: {m.source}</span>}
                  {m.destination && <span>{t("stock.destination")}: {m.destination}</span>}
                </div>
                {m.note && <p className="text-muted-foreground italic">{m.note}</p>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
