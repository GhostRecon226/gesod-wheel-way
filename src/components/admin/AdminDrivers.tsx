import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import PaymentMethodBadge from "@/components/admin/PaymentMethodBadge";
import DriverFormModal from "@/components/admin/DriverFormModal";
import { ACTIVE_LOAD_STATUSES, type Driver } from "@/lib/drivers";

interface LoadRow { id: string; driver_id: string | null; status: string | null; }
interface PaymentRow { driver_id: string | null; amount: number | null; status: string; }

const AdminDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loads, setLoads] = useState<LoadRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    const [driversRes, loadsRes, paymentsRes] = await Promise.all([
      supabase.from("drivers").select("*").order("name"),
      supabase.from("loads").select("id, driver_id, status"),
      supabase.from("driver_payments").select("driver_id, amount, status"),
    ]);

    if (driversRes.error || loadsRes.error || paymentsRes.error) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }

    setDrivers(driversRes.data ?? []);
    setLoads(loadsRes.data ?? []);
    setPayments(paymentsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const map = new Map<string, { activeLoads: number; totalPaid: number }>();
    for (const l of loads) {
      if (!l.driver_id || !ACTIVE_LOAD_STATUSES.includes(l.status ?? "")) continue;
      const entry = map.get(l.driver_id) ?? { activeLoads: 0, totalPaid: 0 };
      entry.activeLoads += 1;
      map.set(l.driver_id, entry);
    }
    for (const p of payments) {
      if (!p.driver_id || p.status !== "paid") continue;
      const entry = map.get(p.driver_id) ?? { activeLoads: 0, totalPaid: 0 };
      entry.totalPaid += Number(p.amount ?? 0);
      map.set(p.driver_id, entry);
    }
    return map;
  }, [loads, payments]);

  const visibleDrivers = drivers.filter((d) => showInactive || d.active);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (d: Driver) => { setEditing(d); setShowForm(true); };

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
        <h2 className="text-lg font-bold text-silver">Drivers</h2>
        <div className="flex gap-2">
          <Button variant="copper-outline" onClick={() => navigate("/dashboard/admin/driver-payments")}>Payments Overview</Button>
          <Button variant="copper" onClick={openCreate}>Add Driver</Button>
        </div>
      </div>

      <label className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
        <Switch checked={showInactive} onCheckedChange={setShowInactive} />
        Show inactive drivers
      </label>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Active Loads</th>
              <th className="px-4 py-3">Total Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleDrivers.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No drivers found.</td></tr>
            ) : (
              visibleDrivers.map((d, i) => {
                const s = stats.get(d.id) ?? { activeLoads: 0, totalPaid: 0 };
                return (
                  <tr key={d.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                    <td className="px-4 py-3 text-silver">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.email ?? "-"}</td>
                    <td className="px-4 py-3"><PaymentMethodBadge method={d.payment_method} /></td>
                    <td className="px-4 py-3 text-silver">{s.activeLoads}</td>
                    <td className="px-4 py-3 text-silver">${s.totalPaid.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={d.active ? "badge-arrived" : "badge-copper"}>{d.active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="copper-outline" size="sm" onClick={() => navigate(`/dashboard/admin/drivers/${d.id}`)}>View</Button>
                        <Button variant="copper-outline" size="sm" onClick={() => openEdit(d)}>Edit</Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DriverFormModal open={showForm} onClose={() => setShowForm(false)} onSaved={fetchData} editing={editing} />
    </div>
  );
};

export default AdminDrivers;
