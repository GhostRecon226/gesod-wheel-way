import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LOAD_STATUSES, type Load } from "@/lib/loads";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  load: Load;
}

const UpdateLoadStatusModal = ({ open, onClose, onUpdated, load }: Props) => {
  const { user } = useAuth();
  const [status, setStatus] = useState(load.status ?? LOAD_STATUSES[0].value);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(load.status ?? LOAD_STATUSES[0].value);
      setNotes("");
    }
  }, [open, load.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { error: historyError } = await supabase.from("load_status_history").insert({
      load_id: load.id,
      status,
      notes: notes.trim() || null,
      updated_by: user.id,
    });
    if (historyError) {
      toast({ title: "Error", description: historyError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.from("loads").update({ status }).eq("id", load.id);
    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Status updated" });
    onUpdated();
    onClose();
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Load Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {LOAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="auth-input" />
          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Update Status"}
            </Button>
            <Button variant="copper-outline" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateLoadStatusModal;
