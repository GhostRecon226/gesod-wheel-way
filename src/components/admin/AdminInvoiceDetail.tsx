import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import { ArrowLeft, Printer } from "lucide-react";
import InvoiceStatusBadge from "@/components/admin/InvoiceStatusBadge";
import EditInvoiceModal from "@/components/admin/EditInvoiceModal";
import { loadTitle, type Load } from "@/lib/loads";
import { INVOICE_STATUSES, invoiceRef, lineItemTypeLabel, type Invoice, type InvoiceLineItem } from "@/lib/invoices";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm text-foreground">{value}</span>
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <h2 className="mb-3 text-lg text-silver">{title}</h2>
    {children}
  </div>
);

const NEXT_ACTION: Record<string, { label: string; nextStatus: string } | undefined> = {
  draft: { label: "Approve Invoice", nextStatus: "approved" },
  approved: { label: "Mark as Sent", nextStatus: "sent" },
  sent: { label: "Mark as Paid", nextStatus: "paid" },
};

const AdminInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(false);

    const { data: invoiceRow, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (invoiceError || !invoiceRow) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }
    setInvoice(invoiceRow);

    const [linksRes, itemsRes, customerRes] = await Promise.all([
      supabase.from("invoice_loads").select("load_id").eq("invoice_id", id),
      supabase.from("invoice_line_items").select("*").eq("invoice_id", id),
      invoiceRow.customer_id
        ? supabase.from("users").select("name").eq("id", invoiceRow.customer_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    setCustomerName((customerRes as { data: { name: string } | null }).data?.name ?? null);
    setItems(itemsRes.data ?? []);

    const loadIds = (linksRes.data ?? []).map((r) => r.load_id).filter((v): v is string => !!v);
    if (loadIds.length > 0) {
      const { data: loadRows } = await supabase.from("loads").select("*").in("id", loadIds);
      setLoads(loadRows ?? []);
    } else {
      setLoads([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const runAction = async (fn: () => Promise<void>) => {
    setActionBusy(true);
    try {
      await fn();
      await fetchAll();
    } finally {
      setActionBusy(false);
    }
  };

  const approveInvoice = () => runAction(async () => {
    if (!invoice || !user) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("id", invoice.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Invoice approved" });
  });

  const markSent = () => runAction(async () => {
    if (!invoice) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", invoice.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Invoice marked as sent" });
  });

  const markPaid = () => runAction(async () => {
    if (!invoice || !user) return;
    const { error: invError } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", invoice.id);
    if (invError) {
      toast({ title: "Error", description: invError.message, variant: "destructive" });
      return;
    }
    const loadIds = loads.map((l) => l.id);
    if (loadIds.length > 0) {
      await Promise.all([
        supabase.from("loads").update({ status: "paid" }).in("id", loadIds),
        supabase.from("load_status_history").insert(loadIds.map((load_id) => ({ load_id, status: "paid", updated_by: user.id }))),
      ]);
    }
    toast({ title: "Invoice marked as paid" });
  });

  if (loading) return <Loader />;
  if (error || !invoice) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Failed to load data. Please try again.</p>
        <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchAll}>Retry</Button>
      </div>
    );
  }

  const itemsByLoad = new Map<string, InvoiceLineItem[]>();
  for (const it of items) {
    const key = it.load_id ?? "unassigned";
    itemsByLoad.set(key, [...(itemsByLoad.get(key) ?? []), it]);
  }
  const grandTotal = items.reduce((s, it) => s + it.amount, 0);
  const currentIdx = INVOICE_STATUSES.findIndex((s) => s.value === invoice.status);
  const nextAction = NEXT_ACTION[invoice.status];
  const stageDate = (value: string) =>
    value === "draft" ? invoice.created_at
      : value === "approved" ? invoice.approved_at
      : value === "sent" ? invoice.sent_at
      : invoice.paid_at;

  const loadOptions = loads.map((l) => ({ id: l.id, vin: l.vin, make: l.make, model: l.model }));

  return (
    <div className="invoice-print-area">
      <Link to="/dashboard/admin/invoices" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper print:hidden">
        <ArrowLeft size={16} /> Back to invoices
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-silver">{invoiceRef(invoice.id)}</h1>
          <p className="text-sm text-muted-foreground">{customerName ?? "Unassigned customer"}</p>
          <div className="mt-2"><InvoiceStatusBadge status={invoice.status} /></div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="copper-outline" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" /> Print / PDF
          </Button>
          {invoice.status === "draft" && (
            <Button variant="copper-outline" onClick={() => setShowEdit(true)}>Edit</Button>
          )}
          {nextAction && (
            <Button variant="copper" disabled={actionBusy} onClick={nextAction.nextStatus === "approved" ? approveInvoice : nextAction.nextStatus === "sent" ? markSent : markPaid}>
              {actionBusy ? "Saving…" : nextAction.label}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Panel title="Line Items by Load">
            {loads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No loads linked to this invoice.</p>
            ) : (
              <div className="space-y-4">
                {loads.map((l) => {
                  const loadItems = itemsByLoad.get(l.id) ?? [];
                  const subtotal = loadItems.reduce((s, it) => s + it.amount, 0);
                  return (
                    <div key={l.id} className="rounded-lg border border-border bg-surface-2 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-silver">{loadTitle(l)} · <span className="font-mono text-xs text-muted-foreground">{l.vin}</span></p>
                        <p className="text-sm text-silver">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <p className="mb-2 text-xs text-muted-foreground">{l.pickup_location ?? "-"}</p>
                      <div className="space-y-1">
                        {loadItems.map((it) => (
                          <div key={it.id} className="flex justify-between text-xs text-muted-foreground">
                            <span>{lineItemTypeLabel(it.type)}{it.description ? ` — ${it.description}` : ""}</span>
                            <span>${it.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-primary bg-surface-2 px-4 py-3">
              <span className="text-sm font-semibold text-silver">Grand Total</span>
              <span className="text-lg font-bold text-primary">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Panel>

          {invoice.notes && (
            <Panel title="Notes">
              <p className="text-sm text-foreground">{invoice.notes}</p>
            </Panel>
          )}
        </div>

        <Panel title="Status Timeline">
          <div className="space-y-0">
            {INVOICE_STATUSES.map((s, i) => {
              const isCompleted = i < currentIdx;
              const isActive = i === currentIdx;
              const isPending = i > currentIdx;
              const isLast = i === INVOICE_STATUSES.length - 1;
              const date = stageDate(s.value);
              return (
                <div key={s.value} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${isCompleted ? "border-primary bg-primary" : isActive ? "border-accent bg-accent" : "border-border bg-transparent"}`}>
                      {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-50" />}
                    </div>
                    {!isLast && <div className="w-px flex-1 min-h-[24px] bg-border" />}
                  </div>
                  <div className={`pb-5 ${isPending ? "opacity-50" : ""}`}>
                    <p className="text-sm font-semibold text-silver">{s.label}</p>
                    {date && <p className="mt-0.5 text-xs text-muted-foreground">{new Date(date).toLocaleString()}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <EditInvoiceModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={fetchAll}
        invoice={invoice}
        lineItems={items}
        loads={loadOptions}
      />
    </div>
  );
};

export default AdminInvoiceDetail;
