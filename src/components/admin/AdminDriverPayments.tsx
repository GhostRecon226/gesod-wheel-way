import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import PaymentMethodBadge from "@/components/admin/PaymentMethodBadge";

interface PendingPayment {
  id: string;
  amount: number | null;
  method: string | null;
  paid_date: string | null;
  driverName: string;
  loadVin: string;
  customerName: string;
  daysPending: number;
}

// driver_payments has no creation timestamp, so "days pending" is measured
// from paid_date — RecordPaymentModal defaults that to the day the payment
// was logged, so it doubles as a reasonably accurate "date it became owed."
const daysSince = (dateStr: string | null) => {
  if (!dateStr) return 0;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
};

const AdminDriverPayments = () => {
  const [rows, setRows] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    setSelected(new Set());

    const paymentsRes = await supabase
      .from("driver_payments")
      .select("id, driver_id, load_id, amount, method, paid_date")
      .eq("status", "pending");

    if (paymentsRes.error) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }

    const pending = paymentsRes.data ?? [];
    const driverIds = Array.from(new Set(pending.map((p) => p.driver_id).filter((v): v is string => !!v)));
    const loadIds = Array.from(new Set(pending.map((p) => p.load_id).filter((v): v is string => !!v)));

    const [driversRes, loadsRes] = await Promise.all([
      driverIds.length > 0 ? supabase.from("drivers").select("id, name").in("id", driverIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      loadIds.length > 0 ? supabase.from("loads").select("id, vin, customer_id").in("id", loadIds) : Promise.resolve({ data: [] as { id: string; vin: string; customer_id: string | null }[] }),
    ]);

    const driverMap = new Map((driversRes.data ?? []).map((d) => [d.id, d.name]));
    const loadMap = new Map((loadsRes.data ?? []).map((l) => [l.id, l]));

    const customerIds = Array.from(
      new Set((loadsRes.data ?? []).map((l) => l.customer_id).filter((v): v is string => !!v))
    );
    const { data: customers } = customerIds.length > 0
      ? await supabase.from("users").select("id, name").in("id", customerIds)
      : { data: [] as { id: string; name: string }[] };
    const customerMap = new Map((customers ?? []).map((c) => [c.id, c.name]));

    const built: PendingPayment[] = pending.map((p) => {
      const load = p.load_id ? loadMap.get(p.load_id) : undefined;
      return {
        id: p.id,
        amount: p.amount,
        method: p.method,
        paid_date: p.paid_date,
        driverName: p.driver_id ? driverMap.get(p.driver_id) ?? "Unknown" : "Unassigned",
        loadVin: load?.vin ?? "-",
        customerName: load?.customer_id ? customerMap.get(load.customer_id) ?? "Unknown" : "Unassigned",
        daysPending: daysSince(p.paid_date),
      };
    });

    built.sort((a, b) => b.daysPending - a.daysPending);
    setRows(built);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const totalPending = useMemo(() => rows.reduce((s, r) => s + Number(r.amount ?? 0), 0), [rows]);

  const markSelectedPaid = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    const { error: markError } = await supabase
      .from("driver_payments")
      .update({ status: "paid" })
      .in("id", Array.from(selected));
    setSubmitting(false);
    if (markError) {
      toast({ title: "Error", description: markError.message, variant: "destructive" });
      return;
    }
    toast({ title: `${selected.size} payment${selected.size === 1 ? "" : "s"} marked as paid` });
    fetchData();
  };

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
        <div>
          <h2 className="text-lg font-bold text-silver">Driver Payments Overview</h2>
          <p className="text-sm text-muted-foreground">{rows.length} pending · ${totalPending.toLocaleString()} outstanding</p>
        </div>
        <Button variant="copper" disabled={selected.size === 0 || submitting} onClick={markSelectedPaid}>
          {submitting ? "Saving…" : `Mark Selected as Paid (${selected.size})`}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3">Driver Name</th>
              <th className="px-4 py-3">Load VIN</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Days Pending</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No pending driver payments.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                  </td>
                  <td className="px-4 py-3 text-silver">{r.driverName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.loadVin}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.customerName}</td>
                  <td className="px-4 py-3 text-silver">{r.amount != null ? `$${r.amount.toLocaleString()}` : "-"}</td>
                  <td className="px-4 py-3"><PaymentMethodBadge method={r.method} /></td>
                  <td className="px-4 py-3 text-silver">{r.daysPending}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDriverPayments;
