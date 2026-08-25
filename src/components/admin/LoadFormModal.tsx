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
import { DESTINATION_TYPES, type Load } from "@/lib/loads";
import { decodeVin } from "@/lib/vinDecode";

interface Option { id: string; name: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: Load | null;
  customers: Option[];
  drivers: Option[];
}

const emptyForm = {
  vin: "",
  lot_number: "",
  buyer_number: "",
  customer_id: "",
  driver_id: "",
  make: "",
  model: "",
  year: "",
  pickup_location: "",
  destination_type: "",
  destination_address: "",
  agreed_pickup_price: "",
  service_fee: "50",
  notes: "",
};

const LoadFormModal = ({ open, onClose, onSaved, editing, customers, drivers }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setVinError(null);
    setForm(
      editing
        ? {
            vin: editing.vin,
            lot_number: editing.lot_number ?? "",
            buyer_number: editing.buyer_number ?? "",
            customer_id: editing.customer_id ?? "",
            driver_id: editing.driver_id ?? "",
            make: editing.make ?? "",
            model: editing.model ?? "",
            year: editing.year?.toString() ?? "",
            pickup_location: editing.pickup_location ?? "",
            destination_type: editing.destination_type ?? "",
            destination_address: editing.destination_address ?? "",
            agreed_pickup_price: editing.agreed_pickup_price?.toString() ?? "",
            service_fee: editing.service_fee?.toString() ?? "50",
            notes: editing.notes ?? "",
          }
        : emptyForm
    );
  }, [open, editing]);

  const f = (k: keyof typeof form, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  // Auto-fill make/model/year from a full VIN when possible; never overwrites
  // fields the admin has already filled in manually.
  const handleVinBlur = async () => {
    const vin = form.vin.trim().toUpperCase();
    if (vin.length !== 17 || (form.make && form.model && form.year)) return;
    setDecoding(true);
    const decoded = await decodeVin(vin);
    setDecoding(false);
    if (!decoded) return;
    setForm((prev) => ({
      ...prev,
      make: prev.make || decoded.make || prev.make,
      model: prev.model || decoded.model || prev.model,
      year: prev.year || (decoded.year ? String(decoded.year) : prev.year),
    }));
    if (decoded.make || decoded.model || decoded.year) {
      toast({ title: "Decoded from VIN", description: "Make/model/year auto-filled — review before saving." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vin.trim()) {
      setVinError("VIN is required.");
      return;
    }
    setVinError(null);
    setSubmitting(true);

    const payload = {
      vin: form.vin.trim(),
      lot_number: form.lot_number.trim() || null,
      buyer_number: form.buyer_number.trim() || null,
      customer_id: form.customer_id || null,
      driver_id: form.driver_id || null,
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      year: form.year ? parseInt(form.year, 10) : null,
      pickup_location: form.pickup_location.trim() || null,
      destination_type: form.destination_type || null,
      destination_address: form.destination_address.trim() || null,
      agreed_pickup_price: form.agreed_pickup_price ? parseFloat(form.agreed_pickup_price) : null,
      service_fee: form.service_fee ? parseFloat(form.service_fee) : 50,
      notes: form.notes.trim() || null,
    };

    const { error } = editing
      ? await supabase.from("loads").update(payload).eq("id", editing.id)
      : await supabase.from("loads").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Load updated" : "Load created" });
      onSaved();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Load" : "New Load"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                placeholder="VIN"
                value={form.vin}
                onChange={(e) => f("vin", e.target.value)}
                onBlur={handleVinBlur}
                className="auth-input"
                aria-invalid={!!vinError}
              />
              {vinError && <p className="mt-1 text-xs text-danger">{vinError}</p>}
              {decoding && <p className="mt-1 text-xs text-muted-foreground">Decoding VIN…</p>}
            </div>
            <Input placeholder="Lot Number" value={form.lot_number} onChange={(e) => f("lot_number", e.target.value)} className="auth-input" />
            <Input placeholder="Buyer Number" value={form.buyer_number} onChange={(e) => f("buyer_number", e.target.value)} className="auth-input" />
            <select
              value={form.customer_id}
              onChange={(e) => f("customer_id", e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Assign customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input placeholder="Make" value={form.make} onChange={(e) => f("make", e.target.value)} className="auth-input" />
            <Input placeholder="Model" value={form.model} onChange={(e) => f("model", e.target.value)} className="auth-input" />
            <Input placeholder="Year" type="number" value={form.year} onChange={(e) => f("year", e.target.value)} className="auth-input" />
            <select
              value={form.driver_id}
              onChange={(e) => f("driver_id", e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Assign driver</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <Input placeholder="Pickup location (yard name & address)" value={form.pickup_location} onChange={(e) => f("pickup_location", e.target.value)} className="auth-input sm:col-span-2" />
            <select
              value={form.destination_type}
              onChange={(e) => f("destination_type", e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Destination type</option>
              {DESTINATION_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <Input placeholder="Destination address" value={form.destination_address} onChange={(e) => f("destination_address", e.target.value)} className="auth-input" />
            <Input placeholder="Agreed pickup price (USD)" type="number" step="0.01" value={form.agreed_pickup_price} onChange={(e) => f("agreed_pickup_price", e.target.value)} className="auth-input" />
            <Input placeholder="Service fee (USD)" type="number" step="0.01" value={form.service_fee} onChange={(e) => f("service_fee", e.target.value)} className="auth-input" />
          </div>
          <Textarea placeholder="Notes" value={form.notes} onChange={(e) => f("notes", e.target.value)} className="auth-input" />

          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
            <Button variant="copper-outline" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoadFormModal;
