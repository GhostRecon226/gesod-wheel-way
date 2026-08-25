import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PAYMENT_METHODS, type Driver } from "@/lib/drivers";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: Driver | null;
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  payment_method: "",
  payment_details: "",
  notes: "",
  active: true,
};

const DriverFormModal = ({ open, onClose, onSaved, editing }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            name: editing.name,
            phone: editing.phone ?? "",
            email: editing.email ?? "",
            payment_method: editing.payment_method ?? "",
            payment_details: editing.payment_details ?? "",
            notes: editing.notes ?? "",
            active: editing.active,
          }
        : emptyForm
    );
  }, [open, editing]);

  const f = (k: keyof typeof form, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; phone?: string } = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      payment_method: form.payment_method || null,
      payment_details: form.payment_details.trim() || null,
      notes: form.notes.trim() || null,
      active: form.active,
    };

    const { error } = editing
      ? await supabase.from("drivers").update(payload).eq("id", editing.id)
      : await supabase.from("drivers").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Driver updated" : "Driver added" });
      onSaved();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Driver" : "Add Driver"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input placeholder="Full Name" value={form.name} onChange={(e) => f("name", e.target.value)} className="auth-input" aria-invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>
          <div>
            <Input placeholder="Phone" value={form.phone} onChange={(e) => f("phone", e.target.value)} className="auth-input" aria-invalid={!!errors.phone} />
            {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
          </div>
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => f("email", e.target.value)} className="auth-input" />
          <select
            value={form.payment_method}
            onChange={(e) => f("payment_method", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            <option value="">Payment method</option>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <Input
            placeholder="Payment details (e.g. Zelle phone number or ACH details)"
            value={form.payment_details}
            onChange={(e) => f("payment_details", e.target.value)}
            className="auth-input"
          />
          <Textarea placeholder="Notes" value={form.notes} onChange={(e) => f("notes", e.target.value)} className="auth-input" />

          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Switch checked={form.active} onCheckedChange={(v) => f("active", v)} />
            Active
          </label>

          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Update" : "Add Driver"}
            </Button>
            <Button variant="copper-outline" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverFormModal;
