import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";

interface Payment {
  id: string; customer_id: string; vehicle_id: string | null;
  stage: string | null; amount: number; currency: string;
  status: string; payment_date: string | null;
}

interface CustomerName { id: string; name: string; }
interface VehicleOption { id: string; label: string; }

const AdminPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<CustomerName[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: "", vehicle_id: "", stage: "", amount: "", currency: "USD" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const [{ data: p }, { data: c }, { data: v }] = await Promise.all([
      supabase.from("payments").select("*").order("payment_date", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
      supabase.from("vehicles").select("id, make, model, year"),
    ]);
    setPayments(p ?? []);
    setCustomers(c ?? []);
    setVehicles((v ?? []).map((x) => ({ id: x.id, label: `${x.year} ${x.make} ${x.model}` })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("payments").insert({
      customer_id: form.customer_id, vehicle_id: form.vehicle_id || null,
      stage: form.stage || null, amount: parseFloat(form.amount),
      currency: form.currency as any, confirmed_by: null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payment created" }); setShowForm(false); setForm({ customer_id: "", vehicle_id: "", stage: "", amount: "", currency: "USD" }); fetchData(); }
    setSubmitting(false);
  };

  const confirmPayment = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("payments").update({ status: "confirmed" as any, confirmed_by: user.id }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payment confirmed" }); fetchData(); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-silver">Payments</h2>
        <Button variant="copper" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Payment"}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground" required>
              <option value="">Customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
              <option value="">Vehicle (optional)</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
            <Input placeholder="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="auth-input" />
            <Input placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="auth-input" required />
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
            </select>
          </div>
          <Button variant="copper" type="submit" disabled={submitting}>Create Payment</Button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const cust = customers.find((c) => c.id === p.customer_id);
              return (
                <tr key={p.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 text-silver">{cust?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.stage ?? "-"}</td>
                  <td className="px-4 py-3 text-silver">{p.currency === "NGN" ? "₦" : "$"}{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={p.status === "confirmed" ? "badge-arrived" : "badge-copper"}>{p.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">
                    {p.status === "pending" && <Button variant="copper" size="sm" onClick={() => confirmPayment(p.id)}>Confirm</Button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
