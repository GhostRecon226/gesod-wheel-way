import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import { ArrowLeft } from "lucide-react";
import InvoiceStatusBadge from "@/components/admin/InvoiceStatusBadge";
import { loadTitle, type Load } from "@/lib/loads";
import { invoiceRef, lineItemTypeLabel, type Invoice, type InvoiceLineItem } from "@/lib/invoices";

type View = "list" | "detail" | "open";

const CustomerInvoices = () => {
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(false);

    // RLS already excludes drafts for customers; this filter is kept explicit
    // since customers must never see a draft invoice under any circumstance.
    const invoicesRes = await supabase
      .from("invoices")
      .select("*")
      .eq("customer_id", user.id)
      .neq("status", "draft")
      .order("created_at", { ascending: false });

    if (invoicesRes.error) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }

    const invoiceIds = (invoicesRes.data ?? []).map((i) => i.id);
    const [itemsRes, loadsRes] = await Promise.all([
      invoiceIds.length > 0
        ? supabase.from("invoice_line_items").select("*").in("invoice_id", invoiceIds)
        : Promise.resolve({ data: [] as InvoiceLineItem[], error: null }),
      supabase.from("loads").select("*").eq("customer_id", user.id),
    ]);

    setInvoices(invoicesRes.data ?? []);
    setItems(itemsRes.data ?? []);
    setLoads(loadsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const loadById = useMemo(() => new Map(loads.map((l) => [l.id, l])), [loads]);
  const itemsByInvoice = useMemo(() => {
    const map = new Map<string, InvoiceLineItem[]>();
    for (const it of items) map.set(it.invoice_id, [...(map.get(it.invoice_id) ?? []), it]);
    return map;
  }, [items]);

  const loadsCount = (invoiceId: string) =>
    new Set((itemsByInvoice.get(invoiceId) ?? []).map((it) => it.load_id).filter(Boolean)).size;

  const openItems = useMemo(() => {
    const openInvoiceIds = new Set(invoices.filter((i) => i.status !== "paid").map((i) => i.id));
    return items
      .filter((it) => openInvoiceIds.has(it.invoice_id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [items, invoices]);

  const openTotal = openItems.reduce((s, it) => s + it.amount, 0);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Failed to load data. Please try again.</p>
        <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  if (view === "detail" && selectedInvoiceId) {
    const invoice = invoices.find((i) => i.id === selectedInvoiceId);
    const invoiceItems = itemsByInvoice.get(selectedInvoiceId) ?? [];
    const itemsByLoad = new Map<string, InvoiceLineItem[]>();
    for (const it of invoiceItems) {
      const key = it.load_id ?? "unassigned";
      itemsByLoad.set(key, [...(itemsByLoad.get(key) ?? []), it]);
    }
    const total = invoiceItems.reduce((s, it) => s + it.amount, 0);

    return (
      <div>
        <button onClick={() => setView("list")} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper">
          <ArrowLeft size={16} /> Back to invoices
        </button>
        {!invoice ? (
          <p className="text-muted-foreground">Invoice not found.</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-silver">{invoiceRef(invoice.id)}</h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <div className="space-y-4">
              {[...itemsByLoad.entries()].map(([loadId, loadItems]) => {
                const load = loadById.get(loadId);
                const subtotal = loadItems.reduce((s, it) => s + it.amount, 0);
                return (
                  <div key={loadId} className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-silver">{load ? loadTitle(load) : "Vehicle"}{load ? <span className="ml-2 font-mono text-xs text-muted-foreground">{load.vin}</span> : null}</p>
                      <p className="text-sm text-silver">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
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
              <div className="flex items-center justify-between rounded-xl border border-primary bg-surface-2 px-4 py-3">
                <span className="text-sm font-semibold text-silver">Total</span>
                <span className="text-lg font-bold text-primary">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (view === "open") {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-silver">Open Charges</h2>
          <Button variant="copper-outline" size="sm" onClick={() => setView("list")}>Back to Invoices</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-muted-foreground">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Running Total</th>
              </tr>
            </thead>
            <tbody>
              {openItems.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No open charges.</td></tr>
              ) : (
                (() => {
                  let running = 0;
                  return openItems.map((it, i) => {
                    running += it.amount;
                    const load = it.load_id ? loadById.get(it.load_id) : undefined;
                    return (
                      <tr key={it.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                        <td className="px-4 py-3 font-mono text-xs text-silver">{invoiceRef(it.invoice_id)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{load ? loadTitle(load) : "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{lineItemTypeLabel(it.type)}</td>
                        <td className="px-4 py-3 text-muted-foreground">${it.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-silver">${running.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-primary bg-surface-2 px-4 py-3">
          <span className="text-sm font-semibold text-silver">Total Open Balance</span>
          <span className="text-lg font-bold text-primary">${openTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-silver">Invoices</h2>
        <Button variant="copper-outline" size="sm" onClick={() => setView("open")}>View All Open Charges</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Loads Count</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">You have no invoices yet.</td></tr>
            ) : (
              invoices.map((inv, i) => (
                <tr
                  key={inv.id}
                  className={`cursor-pointer ${i % 2 === 0 ? "bg-card" : "bg-surface-2"} hover:bg-primary/10`}
                  onClick={() => { setSelectedInvoiceId(inv.id); setView("detail"); }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-silver">{invoiceRef(inv.id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{loadsCount(inv.id)}</td>
                  <td className="px-4 py-3 text-silver">${inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerInvoices;
