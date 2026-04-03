import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ChevronRight } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  vehicle_count?: number;
}

interface Vehicle {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  status: string | null;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewVehicles, setViewVehicles] = useState<{ customer: Customer; vehicles: Vehicle[] } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    const { data } = await supabase.from("users").select("*").eq("role", "customer").order("created_at", { ascending: false });
    if (data) {
      const withCounts = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("customer_id", c.id);
          return { ...c, vehicle_count: count ?? 0 };
        })
      );
      setCustomers(withCounts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone ?? "" });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "" });
    setShowForm(true);
  };

  const openVehicles = async (c: Customer) => {
    const { data } = await supabase.from("vehicles").select("id, make, model, year, vin, status").eq("customer_id", c.id);
    setViewVehicles({ customer: c, vehicles: data ?? [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (editing) {
      const { error } = await supabase.from("users").update({ name: form.name, email: form.email, phone: form.phone || null }).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Customer updated" }); setShowForm(false); fetchCustomers(); }
    } else {
      const { error } = await supabase.from("users").insert({ name: form.name, email: form.email, phone: form.phone || null, role: "customer" as const });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Customer created" }); setShowForm(false); fetchCustomers(); }
    }
    setSubmitting(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  if (viewVehicles) {
    return (
      <div>
        <button onClick={() => setViewVehicles(null)} className="mb-4 text-sm text-gold hover:underline">← Back to customers</button>
        <h2 className="mb-4 text-lg font-bold text-silver">{viewVehicles.customer.name}'s Vehicles</h2>
        {viewVehicles.vehicles.length === 0 ? (
          <p className="text-muted-foreground">No vehicles linked.</p>
        ) : (
          <div className="space-y-2">
            {viewVehicles.vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="font-semibold text-silver">{v.year} {v.make} {v.model}</p>
                  <p className="text-sm text-muted-foreground">VIN: {v.vin ?? "N/A"}</p>
                </div>
                <span className="badge-copper">{v.status ?? "Pending"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-silver">Customers</h2>
        <Button variant="copper" onClick={openCreate}>Add Customer</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold text-silver">{editing ? "Edit Customer" : "New Customer"}</h3>
          <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="auth-input" required />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="auth-input" required />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="auth-input" />
          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>{editing ? "Update" : "Create"}</Button>
            <Button variant="copper-outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Vehicles</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                <td className="px-4 py-3 text-silver">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openVehicles(c)} className="text-gold hover:underline">{c.vehicle_count}</button>
                </td>
                <td className="px-4 py-3">
                  <Button variant="copper-outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
