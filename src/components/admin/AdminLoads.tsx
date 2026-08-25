import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import LoadStatusBadge from "@/components/admin/LoadStatusBadge";
import LoadFormModal from "@/components/admin/LoadFormModal";
import { LOAD_STATUSES, loadTitle, type Load } from "@/lib/loads";

interface Option { id: string; name: string; }

const PAGE_SIZE = 20;

const AdminLoads = () => {
  const navigate = useNavigate();
  const [loads, setLoads] = useState<Load[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [drivers, setDrivers] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Load | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    const [loadsRes, customersRes, driversRes] = await Promise.all([
      supabase.from("loads").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
      supabase.from("drivers").select("id, name").order("name"),
    ]);

    if (loadsRes.error || customersRes.error || driversRes.error) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }

    setLoads(loadsRes.data ?? []);
    setCustomers(customersRes.data ?? []);
    setDrivers(driversRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);
  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.id, d.name])), [drivers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (customerFilter && l.customer_id !== customerFilter) return false;
      if (driverFilter && l.driver_id !== driverFilter) return false;
      if (q) {
        const hay = [l.vin, l.make, l.model].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [loads, search, statusFilter, customerFilter, driverFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetToFirstPage = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (l: Load) => { setEditing(l); setShowForm(true); };

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
        <h2 className="text-lg font-bold text-silver">Loads</h2>
        <Button variant="copper" onClick={openCreate}>New Load</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search VIN, make, model…"
          value={search}
          onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
          className="auth-input w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => resetToFirstPage(setStatusFilter)(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          {LOAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={customerFilter}
          onChange={(e) => resetToFirstPage(setCustomerFilter)(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          <option value="">All customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={driverFilter}
          onChange={(e) => resetToFirstPage(setDriverFilter)(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          <option value="">All drivers</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">VIN</th>
              <th className="px-4 py-3">Make/Model/Year</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Pickup Location</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No loads match these filters.</td></tr>
            ) : (
              paged.map((l, i) => (
                <tr key={l.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 font-mono text-xs text-silver">{l.vin}</td>
                  <td className="px-4 py-3 text-silver">{loadTitle(l)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.customer_id ? customerMap.get(l.customer_id) ?? "Unknown" : "Unassigned"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.pickup_location ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.destination_type ? `${l.destination_type}${l.destination_address ? ` · ${l.destination_address}` : ""}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.driver_id ? driverMap.get(l.driver_id) ?? "Unknown" : "Unassigned"}</td>
                  <td className="px-4 py-3"><LoadStatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="copper-outline" size="sm" onClick={() => navigate(`/dashboard/admin/loads/${l.id}`)}>View</Button>
                      <Button variant="copper-outline" size="sm" onClick={() => openEdit(l)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {currentPage} of {pageCount} · {filtered.length} load{filtered.length === 1 ? "" : "s"}</span>
          <div className="flex gap-2">
            <Button variant="copper-outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="copper-outline" size="sm" disabled={currentPage >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <LoadFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={fetchData}
        editing={editing}
        customers={customers}
        drivers={drivers}
      />
    </div>
  );
};

export default AdminLoads;
