import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InvoiceLineItemsEditor from "@/components/admin/InvoiceLineItemsEditor";
import { nextDraftKey, type Invoice, type InvoiceLineItem, type LineItemDraft } from "@/lib/invoices";

interface LoadOption { id: string; vin: string; make: string | null; model: string | null; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  loads: LoadOption[];
}

const EditInvoiceModal = ({ open, onClose, onSaved, invoice, lineItems, loads }: Props) => {
  const [items, setItems] = useState<LineItemDraft[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setItems(
      lineItems.map((li) => ({
        key: nextDraftKey(),
        id: li.id,
        load_id: li.load_id ?? "",
        type: li.type,
        description: li.description ?? "",
        amount: li.amount,
      }))
    );
    setNotes(invoice.notes ?? "");
  }, [open, invoice, lineItems]);

  const total = items.reduce((sum, it) => sum + (Number.isFinite(it.amount) ? it.amount : 0), 0);

  const handleSave = async () => {
    setSubmitting(true);

    const originalIds = new Set(lineItems.map((li) => li.id));
    const keptIds = new Set(items.filter((it) => it.id).map((it) => it.id!));
    const deletedIds = [...originalIds].filter((id) => !keptIds.has(id));
    const toUpdate = items.filter((it) => it.id);
    const toInsert = items.filter((it) => !it.id);

    const ops: Promise<{ error: { message: string } | null }>[] = [];

    if (deletedIds.length > 0) {
      ops.push(supabase.from("invoice_line_items").delete().in("id", deletedIds));
    }
    for (const it of toUpdate) {
      ops.push(
        supabase
          .from("invoice_line_items")
          .update({ load_id: it.load_id, type: it.type, description: it.description.trim() || null, amount: it.amount })
          .eq("id", it.id!)
      );
    }
    if (toInsert.length > 0) {
      ops.push(
        supabase.from("invoice_line_items").insert(
          toInsert.map((it) => ({
            invoice_id: invoice.id,
            load_id: it.load_id,
            type: it.type,
            description: it.description.trim() || null,
            amount: it.amount,
          }))
        )
      );
    }
    ops.push(supabase.from("invoices").update({ total_amount: total, notes: notes.trim() || null }).eq("id", invoice.id));

    const results = await Promise.all(ops);
    const failed = results.find((r) => r.error);

    setSubmitting(false);
    if (failed?.error) {
      toast({ title: "Error", description: failed.error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Invoice updated" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <InvoiceLineItemsEditor loads={loads} items={items} onChange={setItems} />
          <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="auth-input" />
          <div className="flex gap-3">
            <Button variant="copper" disabled={submitting || items.length === 0} onClick={handleSave}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
            <Button variant="copper-outline" disabled={submitting} onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceModal;
