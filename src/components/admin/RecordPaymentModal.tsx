import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PAYMENT_METHODS, type Driver } from "@/lib/drivers";

interface DeliveredLoad { id: string; vin: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  driver: Driver;
  deliveredLoads: DeliveredLoad[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const RecordPaymentModal = ({ open, onClose, onSaved, driver, deliveredLoads }: Props) => {
  const [loadId, setLoadId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(driver.payment_method ?? "");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadId("");
    setAmount("");
    setMethod(driver.payment_method ?? "");
    setNotes("");
    setDate(todayIso());
    setLoadError(null);
  }, [open, driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadId) {
      setLoadError("Select a load.");
      return;
    }
    setLoadError(null);
    setSubmitting(true);

    // paid_date doubles as "date this payment became owed" while status is
    // pending; it only truly means "date paid" once marked paid.
    const { error } = await supabase.from("driver_payments").insert({
      driver_id: driver.id,
      load_id: loadId,
      amount: amount ? parseFloat(amount) : null,
      method: method || null,
      notes: notes.trim() || null,
      paid_date: date || null,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment recorded" });
      onSaved();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment — {driver.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <select
              value={loadId}
              onChange={(e) => setLoadId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              aria-invalid={!!loadError}
            >
              <option value="">Select delivered load</option>
              {deliveredLoads.map((l) => <option key={l.id} value={l.id}>{l.vin}</option>)}
            </select>
            {loadError && <p className="mt-1 text-xs text-danger">{loadError}</p>}
            {deliveredLoads.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">This driver has no delivered loads yet.</p>
            )}
          </div>
          <Input placeholder="Amount (USD)" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="auth-input" />
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            <option value="">Payment method</option>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="auth-input" />
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="auth-input" />

          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting || deliveredLoads.length === 0}>
              {submitting ? "Saving…" : "Record Payment"}
            </Button>
            <Button variant="copper-outline" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentModal;
