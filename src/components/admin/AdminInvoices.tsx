import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import InvoiceStatusBadge from "@/components/admin/InvoiceStatusBadge";
import CreateInvoiceModal from "@/components/admin/CreateInvoiceModal";
import { INVOICE_STATUSES, invoiceRef, type Invoice } from "@/lib/invoices";

interface Option { id: string; name: string; }

const AdminInvoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [loadsCountByInvoice, setLoadsCountByInvoice] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    const [invoicesRes, customersRes, linksRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
      supabase.from("invoice_loads").select("invoice_id"),
    ]);

    if (invoicesRes.error || customersRes.error || linksRes.error) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }

    const counts = new Map<string, number>();
    for (const row of linksRes.data ?? []) {
      counts.set(row.invoice_id, (counts.get(row.invoice_id) ?? 0) + 1);
    }

    setInvoices(invoicesRes.data ?? []);
    setCustomers(customersRes.data ?? []);
    setLoadsCountByInvoice(counts);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter && inv.status !== statusFilter) return false;
      if (customerFilter && inv.customer_id !== customerFilter) return false;
      return true;
    });
  }, [invoices, statusFilter, customerFilter]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Failed to load data. Please try again.</p>
        <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-silver">Invoices</h2>
        <Button variant="copper" onClick={() => setShowCreate(true)}>Create Invoice</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          {INVOICE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          <option value="">All customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Loads Count</th>
              <th className="px-4 py-3">Total Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No invoices match these filters.</td></tr>
            ) : (
              filtered.map((inv, i) => (
                <tr key={inv.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 font-mono text-xs text-silver">{invoiceRef(inv.id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.customer_id ? customerMap.get(inv.customer_id) ?? "Unknown" : "Unassigned"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{loadsCountByInvoice.get(inv.id) ?? 0}</td>
                  <td className="px-4 py-3 text-silver">${inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Button variant="copper-outline" size="sm" onClick={() => navigate(`/dashboard/admin/invoices/${inv.id}`)}>View</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateInvoiceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchData}
        customers={customers}
      />
    </div>
  );
};

export default AdminInvoices;
