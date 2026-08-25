import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loadTitle, type Load } from "@/lib/loads";
import { DEFAULT_SERVICE_FEE, lineItemTypeLabel, nextDraftKey, type LineItemDraft } from "@/lib/invoices";
import InvoiceLineItemsEditor from "@/components/admin/InvoiceLineItemsEditor";

interface Option { id: string; name: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  customers: Option[];
}

type Step = "customer" | "loads" | "lineItems" | "review";

const CreateInvoiceModal = ({ open, onClose, onCreated, customers }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("customer");
  const [customerId, setCustomerId] = useState("");
  const [loadingLoads, setLoadingLoads] = useState(false);
  const [eligibleLoads, setEligibleLoads] = useState<Load[]>([]);
  const [selectedLoadIds, setSelectedLoadIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<LineItemDraft[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("customer");
    setCustomerId("");
    setEligibleLoads([]);
    setSelectedLoadIds(new Set());
    setItems([]);
    setNotes("");
    setSubmitting(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSelectCustomer = async (id: string) => {
    setCustomerId(id);
    if (!id) { setEligibleLoads([]); return; }
    setLoadingLoads(true);
    const { data, error } = await supabase
      .from("loads")
      .select("*")
      .eq("customer_id", id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });
    setLoadingLoads(false);
    if (error) {
      toast({ title: "Error", description: "Failed to load eligible loads. Please try again.", variant: "destructive" });
      return;
    }
    setEligibleLoads(data ?? []);
  };

  const toggleLoad = (id: string) => {
    setSelectedLoadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const goToLineItems = () => {
    const selected = eligibleLoads.filter((l) => selectedLoadIds.has(l.id));
    const generated: LineItemDraft[] = selected.flatMap((l) => [
      {
        key: nextDraftKey(),
        load_id: l.id,
        type: "base_price",
        description: `Base pickup price — ${loadTitle(l)}`,
        amount: l.agreed_pickup_price ?? 0,
      },
      {
        key: nextDraftKey(),
        load_id: l.id,
        type: "service_fee",
        description: `Service fee — ${loadTitle(l)}`,
        amount: l.service_fee ?? DEFAULT_SERVICE_FEE,
      },
    ]);
    setItems(generated);
    setStep("lineItems");
  };

  const selectedLoads = eligibleLoads.filter((l) => selectedLoadIds.has(l.id));
  const total = items.reduce((sum, it) => sum + (Number.isFinite(it.amount) ? it.amount : 0), 0);

  const handleSubmit = async () => {
    if (!user || selectedLoads.length === 0 || items.length === 0) return;
    setSubmitting(true);

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({ customer_id: customerId, status: "draft", total_amount: total, notes: notes.trim() || null })
      .select("id")
      .single();

    if (invoiceError || !invoice) {
      toast({ title: "Error", description: invoiceError?.message ?? "Failed to create invoice.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const loadIds = selectedLoads.map((l) => l.id);

    const [linksRes, itemsRes] = await Promise.all([
      supabase.from("invoice_loads").insert(loadIds.map((load_id) => ({ invoice_id: invoice.id, load_id }))),
      supabase.from("invoice_line_items").insert(
        items.map((it) => ({
          invoice_id: invoice.id,
          load_id: it.load_id,
          type: it.type,
          description: it.description.trim() || null,
          amount: it.amount,
        }))
      ),
    ]);

    if (linksRes.error || itemsRes.error) {
      toast({ title: "Error", description: "Invoice created, but some line items failed to save. Please review it.", variant: "destructive" });
      setSubmitting(false);
      navigate(`/dashboard/admin/invoices/${invoice.id}`);
      handleClose();
      onCreated();
      return;
    }

    await Promise.all([
      supabase.from("loads").update({ status: "invoiced" }).in("id", loadIds),
      supabase.from("load_status_history").insert(
        loadIds.map((load_id) => ({ load_id, status: "invoiced", updated_by: user.id }))
      ),
    ]);

    toast({ title: "Invoice created" });
    setSubmitting(false);
    onCreated();
    navigate(`/dashboard/admin/invoices/${invoice.id}`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        {step === "customer" && (
          <div className="space-y-4">
            <label className="block text-sm text-muted-foreground">Customer</label>
            <select
              value={customerId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select a customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {loadingLoads && <Loader />}

            {!loadingLoads && customerId && (
              <p className="text-sm text-muted-foreground">
                {eligibleLoads.length} delivered, uninvoiced load{eligibleLoads.length === 1 ? "" : "s"} found for this customer.
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="copper" disabled={!customerId || eligibleLoads.length === 0} onClick={() => setStep("loads")}>
                Continue
              </Button>
              <Button variant="copper-outline" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        )}

        {step === "loads" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-left text-muted-foreground">
                    <th className="px-4 py-3" />
                    <th className="px-4 py-3">VIN</th>
                    <th className="px-4 py-3">Make/Model</th>
                    <th className="px-4 py-3">Pickup Location</th>
                    <th className="px-4 py-3">Agreed Price</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleLoads.map((l, i) => (
                    <tr key={l.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedLoadIds.has(l.id)} onChange={() => toggleLoad(l.id)} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-silver">{l.vin}</td>
                      <td className="px-4 py-3 text-muted-foreground">{loadTitle(l)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.pickup_location ?? "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.agreed_pickup_price != null ? `$${l.agreed_pickup_price.toLocaleString()}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">{selectedLoadIds.size} load{selectedLoadIds.size === 1 ? "" : "s"} selected</p>
            <div className="flex gap-3">
              <Button variant="copper" disabled={selectedLoadIds.size === 0} onClick={goToLineItems}>Continue</Button>
              <Button variant="copper-outline" onClick={() => setStep("customer")}>Back</Button>
            </div>
          </div>
        )}

        {step === "lineItems" && (
          <div className="space-y-4">
            <InvoiceLineItemsEditor
              loads={selectedLoads.map((l) => ({ id: l.id, vin: l.vin, make: l.make, model: l.model }))}
              items={items}
              onChange={setItems}
            />
            <div className="flex gap-3">
              <Button variant="copper" disabled={items.length === 0} onClick={() => setStep("review")}>Continue to Review</Button>
              <Button variant="copper-outline" onClick={() => setStep("loads")}>Back</Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            {selectedLoads.map((l) => {
              const loadItems = items.filter((it) => it.load_id === l.id);
              const subtotal = loadItems.reduce((s, it) => s + it.amount, 0);
              return (
                <div key={l.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-silver">{loadTitle(l)} · <span className="font-mono text-xs text-muted-foreground">{l.vin}</span></p>
                    <p className="text-sm text-silver">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    {loadItems.map((it) => (
                      <div key={it.key} className="flex justify-between text-xs text-muted-foreground">
                        <span>{lineItemTypeLabel(it.type)}{it.description ? ` — ${it.description}` : ""}</span>
                        <span>${it.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between rounded-xl border border-primary bg-surface-2 px-4 py-3">
              <span className="text-sm font-semibold text-silver">Grand Total</span>
              <span className="text-lg font-bold text-primary">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="auth-input" />

            <div className="flex gap-3">
              <Button variant="copper" disabled={submitting} onClick={handleSubmit}>
                {submitting ? "Saving…" : "Save as Draft"}
              </Button>
              <Button variant="copper-outline" disabled={submitting} onClick={() => setStep("lineItems")}>Back</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceModal;
