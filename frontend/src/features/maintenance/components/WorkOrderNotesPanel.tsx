import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { workOrderService } from "@/features/maintenance/services/work-order-service";
import type { MaintenanceNote } from "@/features/maintenance/types";

interface WorkOrderNotesPanelProps {
  workOrderId: string;
  notes: MaintenanceNote[];
  onChanged: () => void;
}

export function WorkOrderNotesPanel({ workOrderId, notes, onChanged }: WorkOrderNotesPanelProps) {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      await workOrderService.addNote(workOrderId, body.trim());
      setBody("");
      onChanged();
    } catch (error: any) {
      toast.error(t("common.error"), { description: error.response?.data?.message || t("common.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t("maintenance.notesTitle")}</h3>

      <div className="space-y-3">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">{t("maintenance.notesEmpty")}</p>}
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MessageSquare className="h-3 w-3" />
              <span className="font-medium text-foreground">{note.createdByName || "-"}</span>
              <span>{new Date(note.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{note.body}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder={t("maintenance.noteAddPlaceholder")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[60px]"
        />
        <Button size="icon" disabled={loading || !body.trim()} onClick={handleAdd}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
