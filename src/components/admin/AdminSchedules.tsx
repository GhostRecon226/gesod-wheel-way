import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Schedule {
  id: string; vessel_name: string; departure_port: string | null;
  etd: string | null; eta_nigeria: string | null;
  destination_port: string | null; status: string; created_at: string;
}

const statusOptions = ["scheduled", "departed", "arrived"];
const statusCls: Record<string, string> = {
  scheduled: "badge-scheduled", departed: "badge-departed", arrived: "badge-arrived",
};
const portOptions = ["Apapa", "Tin Can", "Onne"];

const emptyForm = { vessel_name: "", departure_port: "", etd: "", eta_nigeria: "", destination_port: "", status: "scheduled" };

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("sailing_schedules").select("*").order("etd", { ascending: false });
    setSchedules(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s: Schedule) => {
    setEditing(s);
    setForm({
      vessel_name: s.vessel_name, departure_port: s.departure_port ?? "",
      etd: s.etd ?? "", eta_nigeria: s.eta_nigeria ?? "",
      destination_port: s.destination_port ?? "", status: s.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      vessel_name: form.vessel_name, departure_port: form.departure_port || null,
      etd: form.etd || null, eta_nigeria: form.eta_nigeria || null,
      destination_port: (form.destination_port || null) as any,
      status: form.status as any,
    };

    const { error } = editing
      ? await supabase.from("sailing_schedules").update(payload).eq("id", editing.id)
      : await supabase.from("sailing_schedules").insert(payload);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Schedule updated" : "Schedule created" }); setShowForm(false); fetchData(); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sailing_schedules").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Schedule deleted" }); fetchData(); }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-silver">Sailing Schedules</h2>
        <Button variant="copper" onClick={openCreate}>Add Schedule</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold text-silver">{editing ? "Edit Schedule" : "New Schedule"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Vessel name" value={form.vessel_name} onChange={(e) => setForm({ ...form, vessel_name: e.target.value })} className="auth-input" required />
            <Input placeholder="Departure port" value={form.departure_port} onChange={(e) => setForm({ ...form, departure_port: e.target.value })} className="auth-input" />
            <Input type="date" placeholder="ETD" value={form.etd} onChange={(e) => setForm({ ...form, etd: e.target.value })} className="auth-input" />
            <Input type="date" placeholder="ETA Nigeria" value={form.eta_nigeria} onChange={(e) => setForm({ ...form, eta_nigeria: e.target.value })} className="auth-input" />
            <select value={form.destination_port} onChange={(e) => setForm({ ...form, destination_port: e.target.value })} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
              <option value="">— Destination port —</option>
              {portOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
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
              <th className="px-4 py-3">Vessel</th>
              <th className="px-4 py-3">Departure</th>
              <th className="px-4 py-3">ETD</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, i) => (
              <tr key={s.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                <td className="px-4 py-3 text-silver">{s.vessel_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.departure_port ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.etd ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.eta_nigeria ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.destination_port ?? "—"}</td>
                <td className="px-4 py-3"><span className={statusCls[s.status] ?? "badge-copper"}>{s.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="copper-outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSchedules;
